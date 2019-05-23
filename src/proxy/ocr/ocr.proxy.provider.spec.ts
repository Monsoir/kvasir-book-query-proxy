import { Test, TestingModule } from '@nestjs/testing';
import { Ocr } from './ocr.proxy.provider';

describe('Ocr', () => {
  let provider: Ocr;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Ocr],
    }).compile();

    provider = module.get<Ocr>(Ocr);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
