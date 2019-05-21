import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as TencentCloud from 'tencentcloud-sdk-nodejs';
import { ConfigService } from '$src/config/config.service';

const OCRClient = TencentCloud.ocr.v20181119.Client;
const models = TencentCloud.ocr.v20181119.Models;

const Credential = TencentCloud.common.Credential;
const ClientProfile = TencentCloud.common.ClientProfile;
const HttpProfile = TencentCloud.common.HttpProfile;

const OCREndPoint = 'ocr.tencentcloudapi.com';

interface IOCRRecogizeSuccess {
  texts: string[];
}

@Injectable()
export class OcrService {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  proxyOCR = async (image: any): Promise<IOCRRecogizeSuccess> => {
    const imageStringify = this.convertImageToBase64(image);
    try {
      const texts = await this.promisifyOCRRecognize(imageStringify);
      return texts;
    } catch (e) {
      throw new InternalServerErrorException(e.message);
    }
  }

  private convertImageToBase64 = (imageData: any) => {
    return imageData.buffer.toString('base64');
  }

  private promisifyOCRRecognize = (base64fyImage: string): Promise<IOCRRecogizeSuccess> => {
    const cred = new Credential(
      this.configService.get('TENCENT_SECRET_ID'),
      this.configService.get('TENCENT_SECRET_KEY'),
    );

    const httpProfile = new HttpProfile();
    httpProfile.endpoint = OCREndPoint;

    const clientProfile = new ClientProfile();
    clientProfile.httpProfile = httpProfile;

    const client = new OCRClient(cred, 'ap-guangzhou', clientProfile);

    const req = new models.GeneralBasicOCRRequest();
    const params = `{"ImageBase64":"${base64fyImage}"}`;
    req.from_json_string(params);

    return new Promise((resolve, reject) => {
      client.GeneralBasicOCR(req, (errMsg, response) => {
        if (errMsg) {
            reject({
              code: errMsg.Response.Error.Code,
              message: errMsg.Response.Error.Message,
              requestId: errMsg.Response.RequestId,
            });
            return;
        }
        const recognizeResults = JSON.parse(response.to_json_string());
        const texts = (recognizeResults.TextDetections || []).map(ele => {
          return ele.DetectedText || '';
        });
        resolve({
          texts,
        });
    });
    });
  }
}
