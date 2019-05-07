import { NestFactory, HTTP_SERVER_REF } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, INestExpressApplication } from '@nestjs/common';
import { InternalServerErrorExceptionFilter } from './miscellaneous/filters/internal.serverError.exception.filter';
import { PayloadTooLargeExceptionFilter } from './miscellaneous/filters/payloadTooLarge.exception.filter';
import { BadRequestExceptionFilter } from './miscellaneous/filters/badRequest.exception.filter';
import { UnauthorizedExceptionExceptionFilter } from './miscellaneous/filters/unAuthorized.exception.filter';
import { ConflictExceptionFilterExceptionFilter } from './miscellaneous/filters/conflict.exception.filter';

const configureAppGlobalExceptionFilter = (app: INestApplication & INestExpressApplication) => {
  // 设置全局错误处理拦截器
  const httpRef = app.get(HTTP_SERVER_REF);
  app.useGlobalFilters(new InternalServerErrorExceptionFilter(httpRef));
  app.useGlobalFilters(new PayloadTooLargeExceptionFilter(httpRef));
  app.useGlobalFilters(new BadRequestExceptionFilter(httpRef));
  app.useGlobalFilters(new UnauthorizedExceptionExceptionFilter(httpRef));
  app.useGlobalFilters(new ConflictExceptionFilterExceptionFilter(httpRef));
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureAppGlobalExceptionFilter(app);
  await app.listen(3000);
}
bootstrap();
