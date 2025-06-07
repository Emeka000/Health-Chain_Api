import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SurgicalCase } from './entities/surgical-case.entity';
import { CreateSurgicalCaseDto } from './dto/create-surgical-case.dto';
import { UpdateSurgicalCaseDto } from './dto/update-surgical-case.dto';

@Injectable()
export class SurgicalCaseService {
  constructor(
    @InjectRepository(SurgicalCase)
    private surgicalCaseRepo: Repository<SurgicalCase>,
  ) {}

  create(dto: CreateSurgicalCaseDto) {
    const caseEntity = this.surgicalCaseRepo.create(dto);
    return this.surgicalCaseRepo.save(caseEntity);
  }

  findAll() {
    return this.surgicalCaseRepo.find();
  }

  async findOne(id: string) {
    const caseEntity = await this.surgicalCaseRepo.findOne({ where: { id } });
    if (!caseEntity) throw new NotFoundException('Surgical case not found');
    return caseEntity;
  }

  async update(id: string, dto: UpdateSurgicalCaseDto) {
    const caseEntity = await this.findOne(id);
    Object.assign(caseEntity, dto);
    return this.surgicalCaseRepo.save(caseEntity);
  }

  async remove(id: string) {
    const caseEntity = await this.findOne(id);
    return this.surgicalCaseRepo.remove(caseEntity);
  }
}
