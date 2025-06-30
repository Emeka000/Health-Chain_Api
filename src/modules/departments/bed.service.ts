import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bed, BedStatus } from './entities/bed.entity';

@Injectable()
export class BedService {
  constructor(
    @InjectRepository(Bed)
    private readonly bedRepository: Repository<Bed>,
  ) {}

  async create(data: Partial<Bed>): Promise<Bed> {
    return this.bedRepository.save(data);
  }

  async findAll(): Promise<Bed[]> {
    return this.bedRepository.find({ relations: ['room'] });
  }

  async findOne(id: string): Promise<Bed | null> {
    return this.bedRepository.findOne({ where: { id }, relations: ['room'] });
  }

  async update(id: string, data: Partial<Bed>): Promise<Bed | null> {
    await this.bedRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.bedRepository.delete(id);
  }

  async updateStatus(id: string, status: BedStatus): Promise<Bed | null> {
    await this.bedRepository.update(id, { status });
    return this.findOne(id);
  }

  async assignToPatient(id: string, patientId: string): Promise<Bed | null> {
    await this.bedRepository.update(id, {
      status: BedStatus.OCCUPIED,
      assignedPatientId: patientId,
    });
    return this.findOne(id);
  }

  async releaseBed(id: string): Promise<Bed | null> {
    await this.bedRepository.update(id, {
      status: BedStatus.AVAILABLE,
      assignedPatientId: null,
    });
    return this.findOne(id);
  }
}
