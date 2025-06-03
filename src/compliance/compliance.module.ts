import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import {
  Regulation,
  ComplianceRequirement,
  ComplianceAssessment,
  Finding,
  CorrectiveAction,
  PolicyProcedure,
  AuditLog,
} from './entities';
import {
  TrainingProgram,
  TrainingRecord,
  CompetencyAssessment,
} from './training/entities';
import {
  ComplianceService,
  HipaaService,
  AuditService,
  NotificationService,
} from './services';
import { TrainingService } from './training/services/training.service';
import {
  ComplianceController,
  TrainingController,
  PolicyController,
} from './controllers';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Core compliance entities
      Regulation,
      ComplianceRequirement,
      ComplianceAssessment,
      Finding,
      CorrectiveAction,
      PolicyProcedure,
      AuditLog,
      // Training entities
      TrainingProgram,
      TrainingRecord,
      CompetencyAssessment,
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [ComplianceController, TrainingController, PolicyController],
  providers: [
    ComplianceService,
    HipaaService,
    AuditService,
    NotificationService,
    TrainingService,
  ],
  exports: [ComplianceService, HipaaService, AuditService, TrainingService],
})
export class ComplianceModule {}
