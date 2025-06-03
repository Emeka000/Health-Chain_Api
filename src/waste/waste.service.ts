import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Waste } from './waste.entity';
import { LogWasteDto } from './dto/log-waste.dto';

@Injectable()
export class WasteService {
  constructor(
    @InjectRepository(Waste)
    private readonly repo: Repository<Waste>,
  ) {}

  async logWaste(body: LogWasteDto) {
    const waste = this.repo.create(body);
    return this.repo.save(waste);
  }

  async getAll() {
    return this.repo.find();
  }
}
