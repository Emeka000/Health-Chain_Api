import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IcuController } from './icu.controller';
import { IcuService } from './icu.service';
import { IcuBed } from './entities/icu-bed.entity';
import { IcuPatient } from './entities/icu-patient.entity';
import { VitalSigns } from './entities/vital-signs.entity';
import { Ventilator } from './entities/ventilator.entity';
import { Medication } from './entities/medication.entity';
import { Intervention } from './entities/intervention.entity';
import { QualityMetrics } from './entities/quality-metrics.entity';
import { FamilyCommunication } from './entities/family-communication.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IcuBed,
      IcuPatient,
      VitalSigns,
      Ventilator,
      Medication,
      Intervention,
      QualityMetrics,
      FamilyCommunication,
    ]),
  ],
  controllers: [IcuController],
  providers: [IcuService],
  exports: [IcuService],
})
export class IcuModule {} 