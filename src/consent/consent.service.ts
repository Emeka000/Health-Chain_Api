import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Consent } from '../consent/entities/consent.entity';
import { CreateConsentDto } from './dto/create-consent.dto';
import { UpdateConsentDto } from './dto/update-consent.dto';

@Injectable()
export class ConsentService {
  constructor(
    @InjectRepository(Consent)
    private readonly repo: Repository<Consent>,
  ) {}

  create(createConsentDto: CreateConsentDto) {
    const consent = this.repo.create(createConsentDto);
    return this.repo.save(consent);
  }

  findAll() {
    return this.repo.find();
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  update(id: number, updateConsentDto: UpdateConsentDto) {
    return this.repo.update(id, updateConsentDto);
  }

  remove(id: number) {
    return this.repo.delete(id);
  }
}
