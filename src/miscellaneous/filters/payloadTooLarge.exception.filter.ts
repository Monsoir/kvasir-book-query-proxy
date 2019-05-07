import { BaseExceptionFilter, HTTP_SERVER_REF } from '@nestjs/core';
import { Catch, Inject, HttpServer, ArgumentsHost, PayloadTooLargeException } from '@nestjs/common';
import { Response } from '$src/miscellaneous/formats/response.format';

@Catch(PayloadTooLargeException)
export class PayloadTooLargeExceptionFilter extends BaseExceptionFilter {
  constructor(@Inject(HTTP_SERVER_REF) applicationRef: HttpServer) {
    super(applicationRef);
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const status = exception.getStatus();
    const response = ctx.getResponse();
    response.status(status).json(new Response(false, '文件大小过大'));
  }
}
