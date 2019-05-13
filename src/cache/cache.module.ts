import { Module, CacheModule as NestCacheModule, Global } from '@nestjs/common';
import { CacheService } from './cache.service';
import { ConfigService } from '$src/config/config.service';
import { ConfigModule } from '$src/config/config.module';
import { CacheConfigService } from './cache.config.service';

@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useClass: CacheConfigService,
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService, CacheConfigService],
  exports: [CacheService],
})
export class CacheModule {}
