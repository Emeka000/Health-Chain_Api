import { Injectable } from '@nestjs/common';
import { EncryptionService } from '../common/encryption/encryption.service';

@Injectable()
export class FhirService {
  constructor(private readonly encryptionService: EncryptionService) {}

  async getPatient(id: string) {
    return {
      resourceType: 'Patient',
      id,
    };
  }

  async createPatient(fhirPatient: any) {
    return {
      message: 'Patient created',
      fhirPatient,
    };
  }

  encryptPatientData(patient: any): string {
    return this.encryptionService.encrypt(JSON.stringify(patient));
  }

  decryptPatientData(encrypted: string): any {
    const decrypted = this.encryptionService.decrypt(encrypted);
    return JSON.parse(decrypted);
  }
}
