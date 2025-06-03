import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Patient } from './entities/patient.entity';
import type { CreatePatientDto } from './dto/create-patient.dto';
import type { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientsService {
  constructor(
    private patientsRepository: Repository<Patient>,
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const patient = this.patientsRepository.create({
      ...createPatientDto,
      dateOfBirth: new Date(createPatientDto.dateOfBirth),
      admissionDate: new Date(createPatientDto.admissionDate),
      dischargeDate: createPatientDto.dischargeDate
        ? new Date(createPatientDto.dischargeDate)
        : null,
    });

    return this.patientsRepository.save(patient);
  }

  async findAll(): Promise<Patient[]> {
    return this.patientsRepository.find({
      relations: ['assignments', 'documentation'],
    });
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOne({
      where: { id },
      relations: ['assignments', 'documentation'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
  ): Promise<Patient> {
    const patient = await this.findOne(id);

    if (updatePatientDto.dateOfBirth) {
      updatePatientDto.dateOfBirth = new Date(
        updatePatientDto.dateOfBirth,
      ) as any;
    }

    if (updatePatientDto.admissionDate) {
      updatePatientDto.admissionDate = new Date(
        updatePatientDto.admissionDate,
      ) as any;
    }

    if (updatePatientDto.dischargeDate) {
      updatePatientDto.dischargeDate = new Date(
        updatePatientDto.dischargeDate,
      ) as any;
    }

    Object.assign(patient, updatePatientDto);
    return this.patientsRepository.save(patient);
  }
}
