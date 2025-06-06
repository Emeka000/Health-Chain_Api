import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TreatmentOutcome } from './entities/treatment-outcome.entity'
import { RecordOutcomeDto } from './dto/record-outcome.dto';

@Injectable()
export class OutcomeService {
  constructor(
    @InjectRepository(TreatmentOutcome)
    private readonly repo: Repository<TreatmentOutcome>
  ) {}

  async record(dto: RecordOutcomeDto) {
    const outcome = this.repo.create(dto);
    return this.repo.save(outcome);
  }

  async getOutcomesByPlan(treatmentPlanId: string) {
    return this.repo.find({ where: { treatmentPlanId } });
  }

  async getAverageImprovementByPlan(treatmentPlanId: string) {
    return this.repo
      .createQueryBuilder('outcome')
      .select('AVG(outcome.improvementScore)', 'avg')
      .where('outcome.treatmentPlanId = :id', { id: treatmentPlanId })
      .getRawOne();
  }
}
