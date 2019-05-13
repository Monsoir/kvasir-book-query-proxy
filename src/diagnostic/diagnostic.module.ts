import { Module } from '@nestjs/common';
import { DiagnosticController } from './diagnostic.controller';
import { ValidationModule } from '$src/validation/validation.module';
import { CacheModule } from '$src/cache/cache.module';

@Module({
  imports: [ValidationModule, CacheModule],
  controllers: [DiagnosticController],
})
export class DiagnosticModule {}
