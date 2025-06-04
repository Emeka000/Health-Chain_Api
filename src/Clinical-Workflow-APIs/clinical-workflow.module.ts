import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosisController } from './controllers/diagnosis.controller';
import { PrescriptionController } from './controllers/prescription.controller';
import { ClinicalDocumentationController } from './controllers/clinical-documentation.controller';
import { MedicalProcedureController } from './controllers/medical-procedure.controller';
import { ClinicalDecisionController } from './controllers/clinical-decision.controller';
import { CarePlanController } from './controllers/care-plan.controller';
import { DiagnosisService } from './services/diagnosis.service';
import { PrescriptionService } from './services/prescription.service';
import { ClinicalDocumentationService } from './services/clinical-documentation.service';
import { MedicalProcedureService } from './services/medical-procedure.service';
import { ClinicalDecisionService } from './services/clinical-decision.service';
import { CarePlanService } from './services/care-plan.service';
import * as entities from './entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      entities.Diagnosis,
      entities.TreatmentPlan,
      entities.Prescription,
      entities.Medication,
      entities.ClinicalNote,
      entities.MedicalProcedure,
      entities.Surgery,
      entities.ClinicalAlert,
      entities.CarePlan,
      entities.TreatmentTracking
    ])
  ],
  controllers: [
    DiagnosisController,
    PrescriptionController,
    ClinicalDocumentationController,
    MedicalProcedureController,
    ClinicalDecisionController,
    CarePlanController
  ],
  providers: [
    DiagnosisService,
    PrescriptionService,
    ClinicalDocumentationService,
    MedicalProcedureService,
    ClinicalDecisionService,
    CarePlanService
  ],
  exports: [
    DiagnosisService,
    PrescriptionService,
    ClinicalDocumentationService,
    MedicalProcedureService,
    ClinicalDecisionService,
    CarePlanService
  ]
})
export class ClinicalWorkflowModule {}
