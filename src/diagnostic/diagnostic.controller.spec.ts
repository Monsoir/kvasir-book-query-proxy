import { Test, TestingModule } from '@nestjs/testing';
import { DiagnosticController } from './diagnostic.controller';

describe('Diagnostic Controller', () => {
  let controller: DiagnosticController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DiagnosticController],
    }).compile();

    controller = module.get<DiagnosticController>(DiagnosticController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
