import { Module } from '@nestjs/common';
import { MedicalDataController } from './medical-data.controller';
import { MedicalDataService } from './medical-data.service';
import { MedicalCodeValidatorService } from './medical-code-validator.service';
import { MedicalDataSanitizerService } from './medical-data-sanitizer.service';
import { MedicalAuditService } from './audit-logger.service';
import { MedicalExceptionFilter } from './medical-exception.filter';
import { APP_FILTER } from '@nestjs/core';

@Module({
  controllers: [MedicalDataController],
  providers: [
    MedicalDataService,
    MedicalCodeValidatorService,
    MedicalDataSanitizerService,
    MedicalAuditService,
    {
      provide: APP_FILTER,
      useClass: MedicalExceptionFilter,
    },
  ],
  exports: [
    MedicalDataService,
    MedicalAuditService,
    MedicalCodeValidatorService,
  ],
})
export class MedicalDataModule {}
