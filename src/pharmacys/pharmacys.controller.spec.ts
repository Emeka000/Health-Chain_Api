import { Test, TestingModule } from '@nestjs/testing';
import { PharmacysController } from './pharmacys.controller';
import { PharmacysService } from './pharmacys.service';

describe('PharmacysController', () => {
  let controller: PharmacysController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PharmacysController],
      providers: [PharmacysService],
    }).compile();

    controller = module.get<PharmacysController>(PharmacysController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
