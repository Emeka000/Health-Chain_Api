// diagnosis.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diagnosis } from './entities/diagnosis.entity';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';

@Injectable()
export class DiagnosisService {
  constructor(
    @InjectRepository(Diagnosis)
    private readonly repo: Repository<Diagnosis>
  ) {}

  async create(dto: CreateDiagnosisDto) {
    const diagnosis = this.repo.create(dto);
    return this.repo.save(diagnosis);
  }

  async findAll() {
    return this.repo.find();
  }

  async findByPatient(patientId: string) {
    return this.repo.find({ where: { patientId } });
  }

  async findOne(id: string) {
    const diagnosis = await this.repo.findOneBy({ id });
    if (!diagnosis) {
      throw new NotFoundException(`Diagnosis with id ${id} not found`);
    }
    return diagnosis;
  }
}
