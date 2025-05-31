import { Module } from '@nestjs/common';
import { ClinicalDecisionSupportService } from './clinical-decision-support.service';
import { DataQualityController } from './data-quality.controller';
import { DataGovernanceService } from './data-governance.service';
import { MedicalCodeValidationService } from './medical-code-validation.service';
import { ClinicalDataQualityService } from './clinical-data-quality.service';
import { ReferenceDataService } from './reference-data.service';

@Module({
  providers: [
    MedicalCodeValidationService,
    ClinicalDataQualityService,
    ReferenceDataService,
    ClinicalDecisionSupportService,
    DataGovernanceService,
  ],
  controllers: [DataQualityController],
  exports: [
    MedicalCodeValidationService,
    ClinicalDataQualityService,
    ReferenceDataService,
    ClinicalDecisionSupportService,
    DataGovernanceService,
  ],
})
export class DataQualityModule {}
