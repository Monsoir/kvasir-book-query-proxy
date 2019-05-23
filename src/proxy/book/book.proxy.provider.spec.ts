import { Test, TestingModule } from '@nestjs/testing';
import { BookProxy } from './book.proxy.provider';

describe('BookProxy', () => {
  let provider: BookProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Proxy],
    }).compile();

    provider = module.get<BookProxy>(Proxy);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
