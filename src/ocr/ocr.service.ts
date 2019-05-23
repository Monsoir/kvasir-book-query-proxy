import { Injectable, InternalServerErrorException, Inject } from '@nestjs/common';
import * as TencentCloud from 'tencentcloud-sdk-nodejs';
import { ConfigService } from '$src/config/config.service';
import { CacheService } from '$src/cache/cache.service';
import { OcrProxy } from '$src/proxy/ocr/ocr.proxy.provider';

const OCRClient = TencentCloud.ocr.v20181119.Client;
const models = TencentCloud.ocr.v20181119.Models;

const Credential = TencentCloud.common.Credential;
const ClientProfile = TencentCloud.common.ClientProfile;
const HttpProfile = TencentCloud.common.HttpProfile;

const OCREndPoint = 'ocr.tencentcloudapi.com';

const OCRedCacheKey = 'ocred';

// 计算 TC3-HMAC-SHA256 签名方法
// https://cloud.tencent.com/document/api/213/30654

@Injectable()
export class OcrService {
  constructor(
    private readonly configService: ConfigService,

    @Inject(CacheService)
    private readonly redisCache: CacheService,

    @Inject(OcrProxy)
    private readonly orcProxy: OcrProxy,
  ) {}

  proxyOCR = async (image: any): Promise<string[]> => {
    // 将图片转为 Base64 字符串
    const imageStringify = this.convertImageToBase64(image);

    // 调用 API 识别
    let texts: string[] = [];
    try {
      texts = await this.promisifyOCRRecognize(imageStringify);
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }

    // Redis 记录调用次数
    try {
      await this.redisCache.incr(OCRedCacheKey);
    } catch (e) {
      console.log(e);
    }
    return texts || [];
  }

  ocrRegconize = async (imageData: any): Promise<string[]> => {
    const imageBase64 = this.convertImageToBase64(imageData);
    const result = await this.orcProxy.ocr(imageBase64);
    return result;
  }

  /**
   * 将图片数据转为 Base64 编码
   */
  private convertImageToBase64 = (imageData: any): string => {
    return imageData.toString('base64');
  }


  /**
   * 使用腾讯云提供的 SDK 进行访问
   * - 但该 SDK 只提供了 GET 方法访问，图片数据大于 1MB 左右就失效了
   * - 需要自行实现 TC3-HMAC-SHA256 的鉴权机制来使用 POST 方法
   * - 所以这个方法还是弃用了
   */
  private promisifyOCRRecognize = (base64fyImage: string): Promise<string[]> => {
    const cred = new Credential(
      this.configService.get('TENCENT_SECRET_ID'),
      this.configService.get('TENCENT_SECRET_KEY'),
    );

    const httpProfile = new HttpProfile();
    httpProfile.endpoint = OCREndPoint;
    httpProfile.reqMethod = 'POST';

    const clientProfile = new ClientProfile();
    clientProfile.httpProfile = httpProfile;

    const client = new OCRClient(cred, 'ap-guangzhou', clientProfile);

    const req = new models.GeneralBasicOCRRequest();
    const params = `{"ImageBase64":"${base64fyImage}"}`;
    req.from_json_string(params);

    return new Promise((resolve, reject) => {
      client.GeneralBasicOCR(req, (errMsg, response) => {
        if (errMsg) {
          if (errMsg.Response) {
            reject({
              code: errMsg.Response.Error.Code,
              message: errMsg.Response.Error.Message,
              requestId: errMsg.Response.RequestId,
            });
          } else {
            reject({
              code: errMsg.code,
              message: errMsg.message,
              requestId: errMsg.requestId,
            });
          }
          return;
        }
        const recognizeResults = JSON.parse(response.to_json_string());
        const texts = (recognizeResults.TextDetections || []).map(ele => {
          return ele.DetectedText || '';
        });
        resolve(texts);
    });
    });
  }
}
