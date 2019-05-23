import { Module, CacheModule } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { OcrController } from './ocr.controller';
import { ProxyModule } from '$src/proxy/proxy.module';

@Module({
  imports: [CacheModule, ProxyModule],
  providers: [OcrService],
  controllers: [OcrController],
})
export class OcrModule {
}
