import { Controller, Get, Query, Inject } from '@nestjs/common';
import { ProviderToken } from '$src/miscellaneous/constants';
import { Response } from '$src/miscellaneous/formats/response.format';
import { CacheService } from '$src/cache/cache.service';

@Controller('diagnostic')
export class DiagnosticController {
  constructor(
    @Inject(ProviderToken.validation)
    private readonly validator: ValidatorJS.ValidatorStatic,

    private readonly redisCache: CacheService,
  ) {}

  @Get('ping')
  pong(@Query('msg') message: string) {
    if (this.validator.isEmpty(message || '')) {
      return new Response(true, 'pongong');
    }
    return new Response(true, `pong: ${message}`);
  }

  @Get('ping-redis')
  async pongRedis(@Query('msg') message: string) {
    const result = await this.redisCache.ping(message);
    return new Response(true, result);
  }
}
