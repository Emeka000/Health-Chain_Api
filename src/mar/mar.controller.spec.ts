import { Test, TestingModule } from '@nestjs/testing';
import { MarController } from './controllers/mar.controller';
import { MarService } from './mar.service';

describe('MarController', () => {
  let controller: MarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarController],
      providers: [MarService],
    }).compile();

    controller = module.get<MarController>(MarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
