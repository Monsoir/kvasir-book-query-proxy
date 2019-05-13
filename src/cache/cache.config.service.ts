import { Injectable, CacheOptionsFactory, CacheModuleOptions } from '@nestjs/common';
import { ConfigService } from '$src/config/config.service';
import * as redisStore from 'cache-manager-redis-store';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  public retryStrategy() {
    return {
      retry_strategy: (options: any) => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          // console.warn('Redis 连接出了问题：', options.error);
          return new Error('Redis 服务器拒绝连接');
        }
        if (options.total_retry_time > 1000 * 60) {
          return new Error('重试时间已用完');
        }
        if (options.attempt > 6) {
          return new Error('尝试次数已达极限');
        }
        return Math.min(options.attempt * 100, 3000);
      },
    };
  }

  public createCacheOptions(): CacheModuleOptions {
    /**
     * 配置选项地址，基于 node_redis
     * https://github.com/NodeRedis/node_redis#options-object-properties
     */
    return {
      store: redisStore,
      host: this.configService.get('REDIS_HOST'),
      port: this.configService.get('REDIS_PORT'),
      auth_pass: this.configService.get('REDIS_PASSWORD'),
      retry_strategy: this.retryStrategy,
    };
  }
}
