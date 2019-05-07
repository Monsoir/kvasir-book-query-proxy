import { Module } from '@nestjs/common';
import validator from 'validator';
import { ProviderToken } from '$src/miscellaneous/constants';

@Module({
  providers: [
    {
      provide: ProviderToken.validation,
      useValue: validator,
    },
  ],
  exports: [ProviderToken.validation],
})
export class ValidationModule {}
