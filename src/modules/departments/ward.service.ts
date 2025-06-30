import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ward } from './entities/ward.entity';
import { Room } from './entities/room.entity';

@Injectable()
export class WardService {
  constructor(
    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
  ) {}

  async create(data: Partial<Ward>): Promise<Ward> {
    return this.wardRepository.save(data);
  }

  async findAll(): Promise<Ward[]> {
    return this.wardRepository.find({ relations: ['rooms'] });
  }

  async findOne(id: string): Promise<Ward | null> {
    return this.wardRepository.findOne({ where: { id }, relations: ['rooms'] });
  }

  async update(id: string, data: Partial<Ward>): Promise<Ward | null> {
    await this.wardRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.wardRepository.delete(id);
  }

  async getRooms(wardId: string): Promise<Room[]> {
    return this.roomRepository.find({ where: { ward: { id: wardId } } });
  }
}
