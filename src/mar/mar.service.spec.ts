import { Test, TestingModule } from '@nestjs/testing';
import { MarService } from './mar.service';

describe('MarService', () => {
  let service: MarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MarService],
    }).compile();

    service = module.get<MarService>(MarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
