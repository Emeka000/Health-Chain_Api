import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Shift } from './entities/shift.entity';
import { ShiftHandoff } from './entities/shift-handoff.entity';
import type { CreateShiftDto } from './dto/create-shift.dto';
import type { CreateShiftHandoffDto } from './dto/create-shift-handoff.dto';

@Injectable()
export class ShiftsService {
  private shiftsRepository: Repository<Shift>;
  private handoffsRepository: Repository<ShiftHandoff>;

  constructor(
    @InjectRepository(Shift)
    shiftsRepository: Repository<Shift>,
    @InjectRepository(ShiftHandoff)
    handoffsRepository: Repository<ShiftHandoff>,
  ) {
    this.shiftsRepository = shiftsRepository;
    this.handoffsRepository = handoffsRepository;
  }

  async create(createShiftDto: CreateShiftDto): Promise<Shift> {
    const shift = this.shiftsRepository.create({
      ...createShiftDto,
      startTime: new Date(createShiftDto.startTime),
      endTime: new Date(createShiftDto.endTime),
    });

    return this.shiftsRepository.save(shift);
  }

  async findAll(): Promise<Shift[]> {
    return this.shiftsRepository.find({
      relations: ['nurse', 'department'],
    });
  }

  async findOne(id: string): Promise<Shift> {
    const shift = await this.shiftsRepository.findOne({
      where: { id },
      relations: ['nurse', 'department', 'handoffsGiven', 'handoffsReceived'],
    });

    if (!shift) {
      throw new NotFoundException(`Shift with ID ${id} not found`);
    }

    return shift;
  }

  async createHandoff(
    createHandoffDto: CreateShiftHandoffDto,
  ): Promise<ShiftHandoff> {
    const handoff = this.handoffsRepository.create({
      ...createHandoffDto,
      handoffTime: new Date(createHandoffDto.handoffTime),
    });

    return this.handoffsRepository.save(handoff);
  }

  async completeHandoff(
    handoffId: string,
    comments?: string,
  ): Promise<ShiftHandoff> {
    const handoff = await this.handoffsRepository.findOne({
      where: { id: handoffId },
    });

    if (!handoff) {
      throw new NotFoundException(`Handoff with ID ${handoffId} not found`);
    }

    handoff.isCompleted = true;
    handoff.completedAt = new Date();
    if (comments) {
      handoff.receivingNurseComments = comments;
    }

    return this.handoffsRepository.save(handoff);
  }
}
