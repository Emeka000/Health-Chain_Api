import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../../entities/patient.entity';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async getProfile(patientId: number) {
    return this.patientRepository.findOne({
      where: { id: patientId },
      select: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'dateOfBirth', 'gender', 'address'],
    });
  }

  async updateProfile(patientId: number, updateData: Partial<Patient>) {
    await this.patientRepository.update(patientId, updateData);
    return this.getProfile(patientId);
  }
}
