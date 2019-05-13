import { Controller, Get, Query, Inject } from '@nestjs/common';
import { Response } from '$src/miscellaneous/formats/response.format';
import { CacheService } from '$src/cache/cache.service';

@Controller('diagnostic')
export class DiagnosticController {
  constructor(
    private readonly redisCache: CacheService,
  ) {}

  @Get('ping')
  async ping(@Query('msg') message: string, @Query('service') service: string) {
    switch (service) {
      case 'redis':
        const result = await this.pingRedis(message || '');
        return new Response(true, `response from ${service}: ${result}`);
      default:
        return new Response(true, `pong: ${message}`);
    }
  }

  /**
   * 检查 Redis 是否正常连接
   */
  private async pingRedis(message: string): Promise<string> {
    return this.redisCache.ping(message);
  }
}
