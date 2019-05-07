import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Response } from './miscellaneous/formats/response.format';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return new Response(true, 'hello there');
  }
}
