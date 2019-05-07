import { BaseExceptionFilter, HTTP_SERVER_REF } from '@nestjs/core';
import { Catch, Inject, HttpServer, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from '$src/miscellaneous/formats/response.format';

@Catch()
export class InternalServerErrorExceptionFilter extends BaseExceptionFilter {
  constructor(@Inject(HTTP_SERVER_REF) applicationRef: HttpServer) {
    super(applicationRef);
  }

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      if (typeof exception.message === 'object') {
        response.status(status).json(new Response(false, exception.message.message, exception.message.payload));
      } else {
        response.status(status).json(new Response(false, exception.message.message));
      }
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new Response(false, `500: ${exception.message}`));
    }
  }
}
