import { Test, TestingModule } from '@nestjs/testing';
import { PharmacysService } from './pharmacys.service';

describe('PharmacysService', () => {
  let service: PharmacysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PharmacysService],
    }).compile();

    service = module.get<PharmacysService>(PharmacysService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
