import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMedicalRecordDto } from '../dto/create-medical-record.dto';
import { MedicalRecord } from '../entities/medical-record.entity';

@Injectable()
export class MedicalRecordService {
  constructor(
    @InjectRepository(MedicalRecord)
    private medicalRecordRepository: Repository<MedicalRecord>,
  ) {}

  async create(patientId: string, createMedicalRecordDto: CreateMedicalRecordDto): Promise<MedicalRecord> {
    const medicalRecord = this.medicalRecordRepository.create({
      ...createMedicalRecordDto,
      patientId
    });
    return await this.medicalRecordRepository.save(medicalRecord);
  }

  async findByPatient(patientId: string): Promise<MedicalRecord[]> {
    return await this.medicalRecordRepository.find({
      where: { patientId, isActive: true },
      order: { recordDate: 'DESC' }
    });
  }

  async findOne(id: string): Promise<MedicalRecord> {
    const record = await this.medicalRecordRepository.findOne({
      where: { id },
      relations: ['patient']
    });

    if (!record) {
      throw new NotFoundException('Medical record not found');
    }

    return record;
  }

  async update(id: string, updateData: Partial<CreateMedicalRecordDto>): Promise<MedicalRecord> {
    const record = await this.findOne(id);
    Object.assign(record, updateData);
    return await this.medicalRecordRepository.save(record);
  }

  async delete(id: string): Promise<void> {
    const record = await this.findOne(id);
    record.isActive = false;
    await this.medicalRecordRepository.save(record);
  }
}
