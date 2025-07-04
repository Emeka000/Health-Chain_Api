import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { Bed } from './entities/bed.entity';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Bed)
    private readonly bedRepository: Repository<Bed>,
  ) {}

  async create(data: Partial<Room>): Promise<Room> {
    return this.roomRepository.save(data);
  }

  async findAll(): Promise<Room[]> {
    return this.roomRepository.find({ relations: ['beds', 'ward'] });
  }

  async findOne(id: string): Promise<Room | null> {
    return this.roomRepository.findOne({
      where: { id },
      relations: ['beds', 'ward'],
    });
  }

  async update(id: string, data: Partial<Room>): Promise<Room | null> {
    await this.roomRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.roomRepository.delete(id);
  }

  async getBeds(roomId: string): Promise<Bed[]> {
    return this.bedRepository.find({ where: { room: { id: roomId } } });
  }
}
