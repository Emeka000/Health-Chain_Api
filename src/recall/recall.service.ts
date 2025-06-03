import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Recall } from './entities/recall.entity';
import { Drug } from 'src/pharmacy/entities/drug.entity';
import { CreateRecallDto } from './dto/create-recall.dto';

@Injectable()
export class RecallService {
  constructor(
    @InjectRepository(Recall)
    private readonly recallRepo: Repository<Recall>,
    @InjectRepository(Drug)
    private drugRepo: Repository<Drug>,
  ) {}

  async createRecall(body: CreateRecallDto) {
    const recall = this.recallRepo.create(body);
    return this.recallRepo.save(recall);
  }

  async getAll() {
    return this.recallRepo.find();
  }

  async getRecalledDrugs(): Promise<Drug[]> {
    const recalls = await this.recallRepo.find();
    const lots = recalls.map((r) => r.id);
    return this.drugRepo.find({ where: { id: In(lots) } });
  }
}
