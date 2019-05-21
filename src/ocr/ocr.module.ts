import { Module, CacheModule } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { OcrController } from './ocr.controller';

@Module({
  imports: [CacheModule],
  providers: [OcrService],
  controllers: [OcrController],
})
export class OcrModule {
}
