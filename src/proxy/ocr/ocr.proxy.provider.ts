import * as crypto from 'crypto';
import * as moment from 'moment';
import * as axios from 'axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '$src/config/config.service';

const TencentCloudHost = 'ocr.tencentcloudapi.com';
const OCRServiceName = 'ocr';
const InvokeRegion = 'ap-guangzhou';
const OCRAction = 'GeneralBasicOCR';
const OCRVersion = '2018-11-19';

const HashAlgorithm = 'sha256';
const DefaultSigningAlgorithm = 'TC3-HMAC-SHA256';

@Injectable()
export class OcrProxy {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  ocr = async (imageBase64String: string): Promise<string[]> => {
    const requestPayload = {
      ImageBase64: imageBase64String,
    };
    const headers = {
      'content-type': 'application/json',
      'host': TencentCloudHost,
    };
    const nowMoment = moment();
    const timestamp = nowMoment.unix();
    const dateOfUTCTimezone = nowMoment.utc(false).format('YYYY-MM-DD');
    const credentialScope = `${dateOfUTCTimezone}/${OCRServiceName}/tc3_request`;

    // 拼接规范请求串
    const { canonicalRequest, signedHeaders } = this.createCanonicalRequest({
      headers,
      requestPayload: JSON.stringify(requestPayload),
    });

    // 拼接待签名字符串
    const signingPayload = this.createSigningPayload({
      timestamp: `${timestamp}`,
      credentialScope,
      canonicalRequest,
      algorithm: DefaultSigningAlgorithm,
    });

    // 计算签名
    const signature = this.createSignature({
      secretKey: this.configService.get('TENCENT_SECRET_KEY') as string,
      dateOfUTCTimezone,
      service: OCRServiceName,
      signingPayload,
    });

    // 拼接 Authorization
    const authorizationContent = this.createAuthorizationContent({
      secretId: this.configService.get('TENCENT_SECRET_ID') as string,
      credentialScope,
      signedHeaders,
      signature,
    });

    const requestHeaders = {
      ...headers,
      'Authorization': authorizationContent,
      'X-TC-Action': OCRAction,
      'X-TC-Version': OCRVersion,
      'X-TC-Timestamp': `${timestamp}`,
      'X-TC-Region': InvokeRegion,
    };

    // return [];

    const response = await axios.default.post(`https://${TencentCloudHost}`, requestPayload, {
      headers: requestHeaders,
    });

    const result = response.data.Response;
    if (result) {
      if (result.Error) {
        throw new Error(`${result.Error.Code}: ${result.Error.Message}`);
      }
      const texts = (result.TextDetections || []).map(ele => {
        return ele.DetectedText || '';
      });
      return texts;
    } else {
      throw new Error(`${response.data.code}: ${response.data.message}`);
    }
  }

  private createCanonicalRequest = (params: {
    headers: {[key: string]: string},
    requestPayload: string,
  }): { canonicalRequest: string, signedHeaders: string } => {
    const { headers, requestPayload } = params;

    const httpRequestMethod = 'POST';
    const canonicalURI = '/';
    const canonicalQueryString = '';
    const canonicalHeaders = (() => {
      const result = Object.keys(headers)
                    .map(ele => {
                      const key = ele.toLowerCase().trim();
                      const value = (headers[ele] as string).toLowerCase().trim();
                      return `${key}:${value}`;
                    })
                    .sort()
                    .join('\n');
      return `${result}\n`;
    })();
    const signedHeaders = (() => {
      const result = Object.keys(headers)
                            .map(ele => ele.toLowerCase())
                            .sort()
                            .join(';');
      return result;
    })();
    const hashedRequestPayload = (() => {
      const hexSHA256edPayload = crypto.createHash(HashAlgorithm).update(requestPayload).digest('hex');
      return hexSHA256edPayload.toLowerCase();
    })();

    return {
      canonicalRequest: `${httpRequestMethod}\n${canonicalURI}\n${canonicalQueryString}\n${canonicalHeaders}\n${signedHeaders}\n${hashedRequestPayload}`,
      signedHeaders,
    };

    /*
      result, something like:
      GET
      /
      Limit=10&Offset=0
      content-type:application/x-www-form-urlencoded
      host:cvm.api.tencentyun.com

      content-type;host
      e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
     */
  }

  private createSigningPayload = (params: {
    timestamp: string,
    credentialScope: string,
    canonicalRequest: string,
    algorithm: string,
  }): string => {
    const { algorithm, timestamp, credentialScope, canonicalRequest } = params;
    const result = [
      algorithm,
      timestamp,
      credentialScope,
      crypto.createHash(HashAlgorithm).update(canonicalRequest).digest('hex').toLowerCase(),
    ].join('\n');
    return result;

  /*
    result, something like:

    TC3-HMAC-SHA256
    1539084154
    2018-10-09/cvm/tc3_request
    91c9c192c14460df6c1ffc69e34e6c5e90708de2a6d282cccf957dbf1aa7f3a7
  */
  }

  private createSignature = (params: {
    secretKey: string,
    dateOfUTCTimezone: string,
    service: string,
    signingPayload: string,
  }): string => {
    const { secretKey, dateOfUTCTimezone, service, signingPayload } = params;

    // create signing secrect key
    const secretDateBuffer = (() => {
      const encrypter = crypto.createHmac(HashAlgorithm, `TC3${secretKey}`);
      encrypter.update(dateOfUTCTimezone);
      return encrypter.digest();
    })();
    const secretServiceBuffer = (() => {
      const encrypter = crypto.createHmac(HashAlgorithm, secretDateBuffer);
      encrypter.update(service);
      return encrypter.digest();
    })();
    const secretSigning = (() => {
      const encrypter = crypto.createHmac(HashAlgorithm, secretServiceBuffer);
      encrypter.update('tc3_request');
      return encrypter.digest();
    })();

    // create signature with secrect key
    return crypto.createHmac(HashAlgorithm, secretSigning)
                  .update(signingPayload)
                  .digest('hex')
                  .toLowerCase();
  }

  private createAuthorizationContent = (params: {
    secretId: string,
    credentialScope: string,
    signedHeaders: string,
    signature: string,
  }): string => {
    const { secretId, credentialScope, signedHeaders, signature } = params;
    return `${DefaultSigningAlgorithm} Credential=${secretId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  }
}
