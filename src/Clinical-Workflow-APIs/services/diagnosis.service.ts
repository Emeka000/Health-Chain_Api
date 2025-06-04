import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diagnosis, TreatmentPlan } from '../entities';
import { CreateDiagnosisDto, UpdateDiagnosisDto } from '../dto/diagnosis.dto';

@Injectable()
export class DiagnosisService {
  constructor(
    @InjectRepository(Diagnosis)
    private diagnosisRepository: Repository<Diagnosis>,
    @InjectRepository(TreatmentPlan)
    private treatmentPlanRepository: Repository<TreatmentPlan>
  ) {}

  async create(createDiagnosisDto: CreateDiagnosisDto): Promise<Diagnosis> {
    const diagnosis = this.diagnosisRepository.create(createDiagnosisDto);
    return this.diagnosisRepository.save(diagnosis);
  }

  async findAll(): Promise<Diagnosis[]> {
    return this.diagnosisRepository.find({
      relations: ['treatmentPlans']
    });
  }

  async findOne(id: string): Promise<Diagnosis> {
    const diagnosis = await this.diagnosisRepository.findOne({
      where: { id },
      relations: ['treatmentPlans']
    });
    if (!diagnosis) {
      throw new NotFoundException(`Diagnosis with ID ${id} not found`);
    }
    return diagnosis;
  }

  async findByPatient(patientId: string): Promise<Diagnosis[]> {
    return this.diagnosisRepository.find({
      where: { patientId },
      relations: ['treatmentPlans'],
      order: { createdAt: 'DESC' }
    });
  }

  async update(id: string, updateDiagnosisDto: UpdateDiagnosisDto): Promise<Diagnosis> {
    await this.diagnosisRepository.update(id, updateDiagnosisDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.diagnosisRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Diagnosis with ID ${id} not found`);
    }
  }

  async createTreatmentPlan(diagnosisId: string, treatmentPlanDto: any): Promise<TreatmentPlan> {
    const diagnosis = await this.findOne(diagnosisId);
    const treatmentPlan = this.treatmentPlanRepository.create({
      ...treatmentPlanDto,
      diagnosis
    });
    return this.treatmentPlanRepository.save(treatmentPlan);
  }
}
