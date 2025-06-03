import { Injectable } from '@nestjs/common';
import { CreateMedicalDataDto } from './medical-data.dto';

@Injectable()
export class MedicalDataSanitizerService {
  sanitizeMedicalData(data: CreateMedicalDataDto): CreateMedicalDataDto {
    return {
      ...data,
      patientId: this.sanitizeString(data.patientId),
      medicalRecordNumber: this.sanitizeString(data.medicalRecordNumber),
      chiefComplaint: this.sanitizeMedicalText(data.chiefComplaint),
      attendingPhysicianId: this.sanitizeString(data.attendingPhysicianId),
      notes: data.notes ? this.sanitizeMedicalText(data.notes) : undefined,
      medicalCodes: data.medicalCodes.map((code) => ({
        ...code,
        icd10Code: this.sanitizeString(code.icd10Code).toUpperCase(),
        cptCode: this.sanitizeString(code.cptCode),
        description: this.sanitizeMedicalText(code.description),
      })),
    };
  }

  private sanitizeString(input: string): string {
    return input
      .trim()
      .replace(/[<>\"'&]/g, '') // Remove potentially harmful characters
      .replace(/\s+/g, ' '); // Normalize whitespace
  }

  private sanitizeMedicalText(input: string): string {
    return input
      .trim()
      .replace(/[<>\"'&]/g, '')
      .replace(/\s+/g, ' ')
      .substring(0, 1000); // Limit length for security
  }
}
