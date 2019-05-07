import { Module } from '@nestjs/common';
import { Proxy } from './proxy.provider';

@Module({
  providers: [Proxy],
  exports: [Proxy],
})
export class ProxyModule {}
