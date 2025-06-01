import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LabTest } from './entities/lab-test.entity';
import { Specimen } from './entities/specimen.entity';
import { TestOrder } from './entities/test-order.entity';
import { LabResult } from './entities/lab-result.entity';
import { QualityControl } from './entities/quality-control.entity';
import { LabController } from './lab.controller';
import { LabService } from './services/lab.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LabTest,
      Specimen,
      TestOrder,
      LabResult,
      QualityControl,
    ]),
  ],
  controllers: [LabController],
  providers: [LabService],
  exports: [LabService],
})
export class LabModule {}
