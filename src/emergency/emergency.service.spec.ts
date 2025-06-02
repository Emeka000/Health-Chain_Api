import { Test, TestingModule } from '@nestjs/testing';
import { EmergencyService } from './emergency.service';

describe('EmergencyService', () => {
  let service: EmergencyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmergencyService],
    }).compile();

    service = module.get<EmergencyService>(EmergencyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
