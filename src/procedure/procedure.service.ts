import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicalProcedure } from './entities/medical-procedure.entity'; 
import { ScheduleProcedureDto } from './dto/schedule-procedure.dto';
import { UpdateProcedureStatusDto } from './dto/update-procedure-status.dto';

@Injectable()
export class ProcedureService {
  constructor(
    @InjectRepository(MedicalProcedure)
    private readonly repo: Repository<MedicalProcedure>
  ) {}

  async schedule(dto: ScheduleProcedureDto) {
    const procedure = this.repo.create(dto);
    return this.repo.save(procedure);
  }

  async updateStatus(id: string, dto: UpdateProcedureStatusDto) {
    return this.repo.update(id, dto);
  }

  async findByPlan(treatmentPlanId: string) {
    return this.repo.find({ where: { treatmentPlanId } });
  }
}
