import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { BooksProviders } from './books.providers';
import { MongoModule } from '$src/mongo/mongo.module';
import { ProxyModule } from '$src/proxy/proxy.module';
import { ValidationModule } from '$src/validation/validation.module';
import { CacheModule } from '$src/cache/cache.module';

@Module({
  imports: [MongoModule, ValidationModule, ProxyModule, CacheModule],
  controllers: [BooksController],
  providers: [
    BooksService,
    ...BooksProviders,
  ],
})
export class BooksModule {
}
