import { Module } from '@nestjs/common';
import { BookProxy } from './book/book.proxy.provider';
import { OcrProxy } from './ocr/ocr.proxy.provider';

@Module({
  providers: [BookProxy, OcrProxy],
  exports: [BookProxy, OcrProxy],
})
export class ProxyModule {}
