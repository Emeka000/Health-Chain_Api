import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { CreatePatientDto } from '../dto/create-patient.dto';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    // Check if patient with email already exists
    const existingPatient = await this.patientRepository.findOne({
      where: { email: createPatientDto.email }
    });

    if (existingPatient) {
      throw new ConflictException('Patient with this email already exists');
    }

    const patient = this.patientRepository.create(createPatientDto);
    return await this.patientRepository.save(patient);
  }

  async findAll(page: number = 1, limit: number = 10): Promise<{ patients: Patient[], total: number }> {
    const [patients, total] = await this.patientRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    return { patients, total };
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: ['medicalRecords', 'appointments', 'communications', 'consents']
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  async search(query: string, page: number = 1, limit: number = 10): Promise<{ patients: Patient[], total: number }> {
    const [patients, total] = await this.patientRepository.findAndCount({
      where: [
        { firstName: Like(`%${query}%`) },
        { lastName: Like(`%${query}%`) },
        { email: Like(`%${query}%`) },
        { phone: Like(`%${query}%`) }
      ],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' }
    });

    return { patients, total };
  }

  async update(id: string, updateData: Partial<CreatePatientDto>): Promise<Patient> {
    const patient = await this.findOne(id);
    Object.assign(patient, updateData);
    return await this.patientRepository.save(patient);
  }

  async deactivate(id: string): Promise<Patient> {
    const patient = await this.findOne(id);
    patient.status = 'inactive';
    return await this.patientRepository.save(patient);
  }
}
