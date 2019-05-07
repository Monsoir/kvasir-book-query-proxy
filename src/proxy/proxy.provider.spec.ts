import { Test, TestingModule } from '@nestjs/testing';
import { Proxy } from './proxy.provider';

describe('Proxy', () => {
  let provider: Proxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Proxy],
    }).compile();

    provider = module.get<Proxy>(Proxy);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
