import { Controller, UseGuards, Post, UseInterceptors, FileFieldsInterceptor, BadRequestException, UploadedFiles, Req } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { AuthGuard } from '$src/miscellaneous/guards/auth.guard';
import { Response } from '$src/miscellaneous/formats/response.format';

const ImageMaxSize = 2.25; // 转换为 Base64 编码后，大小不能超过 3MB, 4/3(originSize) = 3

@Controller('ocr')
export class OcrController {
  constructor(
    private readonly ocrService: OcrService,
  ) {}

  @UseGuards(AuthGuard)
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'image', maxCount: 1 }],
      {
        limits: {
          fileSize: ImageMaxSize * 1024 * 1024, // 单位 MB
        },
        fileFilter: (req: any, file: any, callback: any) => {
          // 过滤不合法的文件格式
          if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
            callback(null, true);
          } else {
            callback(new BadRequestException('不支持该格式'), false);
          }
        },
      },
    ),
  )
  @Post('/')
  async recoginize(@UploadedFiles() files, @Req() request) {
    let image = null;
    if (files && files.image && files.image[0]) {
      // for content-type is `www-form-urlencoded`
      // image = files.image[0];
      image = files.image[0].buffer;
    }

    if (image === null || image === undefined) {
      throw new BadRequestException('上传文件不存在');
    }

    const result = await this.ocrService.ocrRegconize(image);
    return new Response(true, '', {
      texts: result,
    });
  }
}
