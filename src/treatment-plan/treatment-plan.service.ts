import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreatmentPlan } from './entities/treatment-plan.entity'; 
import { CreateTreatmentPlanDto } from './dto/create-treatment-plan.dto';

@Injectable()
export class TreatmentPlanService {
  constructor(
    @InjectRepository(TreatmentPlan)
    private readonly repo: Repository<TreatmentPlan>
  ) {}

  async create(dto: CreateTreatmentPlanDto) {
    const plan = this.repo.create({ ...dto, status: 'active' });
    return this.repo.save(plan);
  }

  async findByDiagnosis(diagnosisId: string) {
    return this.repo.find({ where: { diagnosisId } });
  }

  async completePlan(id: string) {
    return this.repo.update(id, { status: 'completed' });
  }

  async cancelPlan(id: string) {
    return this.repo.update(id, { status: 'cancelled' });
  }
}
