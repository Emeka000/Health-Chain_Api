import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { Prescription } from '../entities/prescription.entity';

export interface CreatePatientDto {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  phoneNumber?: string;
  address?: string;
  allergies?: string[];
  medicalConditions?: string[];
  insuranceId?: string;
}

@Controller('patients')
export class PatientController {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  @Post()
  async create(@Body() createPatientDto: CreatePatientDto): Promise<Patient> {
    const patient = this.patientRepository.create(createPatientDto);
    return await this.patientRepository.save(patient);
  }

  @Get()
  async findAll(): Promise<Patient[]> {
    return await this.patientRepository.find({
      relations: ['prescriptions'],
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id },
      relations: [
        'prescriptions',
        'prescriptions.items',
        'prescriptions.items.drug',
      ],
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return patient;
  }

  @Get(':id/prescriptions')
  async getPatientPrescriptions(
    @Param('id') id: string,
  ): Promise<Prescription[]> {
    const patient = await this.findOne(id);
    return patient.prescriptions;
  }
}
