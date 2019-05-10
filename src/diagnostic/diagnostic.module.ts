import { Module } from '@nestjs/common';
import { DiagnosticController } from './diagnostic.controller';
import { ValidationModule } from '$src/validation/validation.module';

@Module({
  imports: [ValidationModule],
  controllers: [DiagnosticController],
})
export class DiagnosticModule {}
