import { Test, TestingModule } from '@nestjs/testing';
import { LabController } from './lab.controller';
import { LabService } from './lab.service';

describe('LabController', () => {
  let controller: LabController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabController],
      providers: [LabService],
    }).compile();

    controller = module.get<LabController>(LabController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
