import { Controller, Get, Query, Inject } from '@nestjs/common';
import { ProviderToken } from '$src/miscellaneous/constants';
import { Response } from '$src/miscellaneous/formats/response.format';

@Controller('diagnostic')
export class DiagnosticController {
  constructor(
    @Inject(ProviderToken.validation)
    private readonly validator: ValidatorJS.ValidatorStatic,
  ) {}

  @Get('ping')
  pong(@Query('msg') message: string) {
    if (this.validator.isEmpty(message || '')) {
      return new Response(true, 'pong');
    }
    return new Response(true, `pong: ${message}`);
  }
}
