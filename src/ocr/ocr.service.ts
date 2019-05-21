import { Injectable, InternalServerErrorException, Inject } from '@nestjs/common';
import * as TencentCloud from 'tencentcloud-sdk-nodejs';
import { ConfigService } from '$src/config/config.service';
import { CacheService } from '$src/cache/cache.service';

const OCRClient = TencentCloud.ocr.v20181119.Client;
const models = TencentCloud.ocr.v20181119.Models;

const Credential = TencentCloud.common.Credential;
const ClientProfile = TencentCloud.common.ClientProfile;
const HttpProfile = TencentCloud.common.HttpProfile;

const OCREndPoint = 'ocr.tencentcloudapi.com';

const OCRedCacheKey = 'ocred';

@Injectable()
export class OcrService {
  constructor(
    private readonly configService: ConfigService,

    @Inject(CacheService)
    private readonly redisCache: CacheService,
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

  private convertImageToBase64 = (imageData: any) => {
    return imageData.buffer.toString('base64');
  }

  private promisifyOCRRecognize = (base64fyImage: string): Promise<string[]> => {
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
        resolve(texts);
    });
    });
  }
}
