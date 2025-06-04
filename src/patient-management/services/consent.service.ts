import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientConsent } from '../entities/patient-consent.entity';

@Injectable()
export class ConsentService {
  constructor(
    @InjectRepository(PatientConsent)
    private consentRepository: Repository<PatientConsent>,
  ) {}

  async grantConsent(patientId: string, consentType: string, description: string, ipAddress?: string): Promise<PatientConsent> {
    const consent = this.consentRepository.create({
      patientId,
      consentType,
      description,
      status: 'granted',
      grantedAt: new Date(),
      ipAddress
    });

    return await this.consentRepository.save(consent);
  }

  async revokeConsent(patientId: string, consentType: string): Promise<PatientConsent> {
    const consent = await this.consentRepository.findOne({
      where: { patientId, consentType, status: 'granted' }
    });

    if (consent) {
      consent.status = 'revoked';
      consent.revokedAt = new Date();
      return await this.consentRepository.save(consent);
    } else {
      throw new Error('Consent not found');
    }
  }

  async findByPatient(patientId: string): Promise<PatientConsent[]> {
    return await this.consentRepository.find({
      where: { patientId },
      order: { createdAt: 'DESC' }
    });
  }

  async checkConsent(patientId: string, consentType: string): Promise<boolean> {
    const consent = await this.consentRepository.findOne({
      where: { patientId, consentType, status: 'granted' }
    });

    return !!consent;
  }
}