import { Injectable, Logger } from '@nestjs/common';
import { CreateMedicalDataDto, EmergencyLevel } from './medical-data.dto';
import { MedicalCodeValidatorService } from './medical-code-validator.service';
import { MedicalDataSanitizerService } from './medical-data-sanitizer.service';
import { MedicalAuditService } from './audit-logger.service';
import { MedicalValidationException, MedicalEmergencyException } from './medical-exception.filter';

@Injectable()
export class MedicalDataService {
  private readonly logger = new Logger(MedicalDataService.name);

  constructor(
    private readonly codeValidator: MedicalCodeValidatorService,
    private readonly sanitizer: MedicalDataSanitizerService,
    private readonly auditService: MedicalAuditService
  ) {}

  async createMedicalRecord(data: CreateMedicalDataDto, userId: string, ipAddress: string): Promise<any> {
    try {
      // Sanitize all input data
      const sanitizedData = this.sanitizer.sanitizeMedicalData(data);

      // Validate medical codes
      await this.validateMedicalCodes(sanitizedData);

      // Check for emergency conditions
      await this.handleEmergencyLevel(sanitizedData, userId, ipAddress);

      // Simulate saving to database
      const savedRecord = {
        id: `med_${Date.now()}`,
        ...sanitizedData,
        createdAt: new Date(),
        createdBy: userId
      };

      // Log successful creation
      await this.auditService.logMedicalEvent({
        eventType: 'CREATE',
        userId,
        patientId: sanitizedData.patientId,
        resourceId: savedRecord.id,
        details: `Medical record created for patient ${sanitizedData.patientId}`,
        ipAddress,
        severity: 'INFO'
      });

      return {
        id: savedRecord.id,
        status: 'created',
        message: 'Medical record successfully created'
      };

    } catch (error) {
      this.logger.error(`Error creating medical record: ${error.message}`);
      throw error;
    }
  }

  private async validateMedicalCodes(data: CreateMedicalDataDto): Promise<void> {
    const validationErrors: string[] = [];

    for (const medicalCode of data.medicalCodes) {
      // Validate ICD-10 code
      const icd10Validation = await this.codeValidator.validateICD10Code(medicalCode.icd10Code);
      if (!icd10Validation.isValid) {
        validationErrors.push(`Invalid ICD-10 code: ${medicalCode.icd10Code}`);
      }

      // Validate CPT code
      const cptValidation = await this.codeValidator.validateCPTCode(medicalCode.cptCode);
      if (!cptValidation.isValid) {
        validationErrors.push(`Invalid CPT code: ${medicalCode.cptCode}`);
      }
    }

    if (validationErrors.length > 0) {
      throw new MedicalValidationException(
        validationErrors,
        data.patientId,
        data.medicalRecordNumber
      );
    }
  }

  private async handleEmergencyLevel(data: CreateMedicalDataDto, userId: string, ipAddress: string): Promise<void> {
    if (data.emergencyLevel === EmergencyLevel.CRITICAL) {
      // Log critical emergency
      await this.auditService.logMedicalEvent({
        eventType: 'EMERGENCY_ALERT',
        userId,
        patientId: data.patientId,
        details: `CRITICAL emergency detected for patient. Chief complaint: ${data.chiefComplaint}`,
        ipAddress,
        severity: 'CRITICAL'
      });

      // In a real system, this would trigger emergency protocols
      this.logger.error(`CRITICAL MEDICAL EMERGENCY - Patient: ${data.patientId}`);
      
      // Don't throw exception for critical cases - they need to be processed
      // But ensure proper alerting is in place
    }
  }
}
