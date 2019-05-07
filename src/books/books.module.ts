import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { BooksProviders } from './books.providers';
import { MongoModule } from '$src/mongo/mongo.module';
import { ProxyModule } from '$src/proxy/proxy.module';
import { ValidationModule } from '$src/validation/validation.module';

@Module({
  imports: [MongoModule, ValidationModule, ProxyModule],
  controllers: [BooksController],
  providers: [
    BooksService,
    ...BooksProviders,
  ],
})
export class BooksModule {
}
