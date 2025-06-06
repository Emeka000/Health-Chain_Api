import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarePlanTemplate } from './entities/care-plan-template.entity';
import { CreateCarePlanTemplateDto } from './dto/care-plan-template.dto';

@Injectable()
export class CarePlanTemplateService {
  constructor(
    @InjectRepository(CarePlanTemplate)
    private repo: Repository<CarePlanTemplate>
  ) {}

  create(dto: CreateCarePlanTemplateDto) {
    const template = this.repo.create(dto);
    return this.repo.save(template);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: string) {
    return this.repo.findOneBy({ id });
  }
}
