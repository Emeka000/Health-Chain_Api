import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationService } from './medication.service';
import { MedicationController } from './medication.controller';
import { MedicationReminder } from '../entities/medication-reminder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MedicationReminder])],
  providers: [MedicationService],
  controllers: [MedicationController],
})
export class MedicationModule {}