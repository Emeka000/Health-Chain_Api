import { Test, TestingModule } from '@nestjs/testing';
import { SurgicalCaseService } from './surgical-case.service';

describe('SurgicalCaseService', () => {
  let service: SurgicalCaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SurgicalCaseService],
    }).compile();

    service = module.get<SurgicalCaseService>(SurgicalCaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
