import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Bed, BedStatus } from '../entities/bed.entity';
import { BedAllocation } from '../entities/bed-allocation.entity';
import { FilterQuery } from '../interfaces/common.interface';

@Injectable()
export class BedService {
  constructor(
    @InjectRepository(Bed)
    private bedRepository: Repository<Bed>,
    @InjectRepository(BedAllocation)
    private bedAllocationRepository: Repository<BedAllocation>,
  ) {}

  async create(createBedDto: any): Promise<Bed> {
    const existingBed = await this.bedRepository.findOne({
      where: { bedNumber: createBedDto.bedNumber }
    });

    if (existingBed) {
      throw new BadRequestException('Bed with this number already exists');
    }

    const bed = this.bedRepository.create(createBedDto);
    return await this.bedRepository.save(bed);
  }

  async findAll(query: FilterQuery): Promise<{ data: Bed[]; pagination: any }> {
    const { page = 1, limit = 10, sortBy = 'bedNumber', sortOrder = 'ASC', search, status } = query;

    const whereConditions: any = {};
    
    if (search) {
      whereConditions.bedNumber = Like(`%${search}%`);
    }
    
    if (status) {
      whereConditions.status = status;
    }

    if (query.departmentId) {
      whereConditions.departmentId = query.departmentId;
    }

    const options: FindManyOptions<Bed> = {
      where: whereConditions,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['hospital', 'department', 'allocations'],
    };

    const [beds, total] = await this.bedRepository.findAndCount(options);

    return {
      data: beds,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAvailableBeds(query: FilterQuery): Promise<Bed[]> {
    const whereConditions: any = {
      status: BedStatus.AVAILABLE,
    };

    if (query.departmentId) {
      whereConditions.departmentId = query.departmentId;
    }

    if (query.type) {
      whereConditions.type = query.type;
    }

    return await this.bedRepository.find({
      where: whereConditions,
      relations: ['department'],
      order: { bedNumber: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Bed> {
    const bed = await this.bedRepository.findOne({
      where: { id },
      relations: ['hospital', 'department', 'allocations', 'allocations.patient'],
    });

    if (!bed) {
      throw new NotFoundException('Bed not found');
    }

    return bed;
  }

  async update(id: string, updateDto: any): Promise<Bed> {
    const bed = await this.findOne(id);
    
    Object.assign(bed, updateDto);
    return await this.bedRepository.save(bed);
  }

  async remove(id: string): Promise<void> {
    const bed = await this.findOne(id);
    
    if (bed.status === BedStatus.OCCUPIED) {
      throw new BadRequestException('Cannot delete an occupied bed');
    }

    await this.bedRepository.remove(bed);
  }

  async allocateBed(bedId: string, allocationDto: any): Promise<BedAllocation> {
    const bed = await this.findOne(bedId);
    
    if (bed.status !== BedStatus.AVAILABLE) {
      throw new BadRequestException('Bed is not available for allocation');
    }

    // Create allocation
    const allocation = this.bedAllocationRepository.create({
      bedId,
      patientId: allocationDto.patientId,
      assignedBy: allocationDto.assignedBy,
      allocationDate: new Date(),
      expectedDischargeDate: allocationDto.expectedDischargeDate,
      notes: allocationDto.notes,
    });

    const savedAllocation = await this.bedAllocationRepository.save(allocation);

    // Update bed status
    await this.bedRepository.update(bedId, { status: BedStatus.OCCUPIED });

    return savedAllocation;
  }

  async deallocateBed(bedId: string, deallocationDto: any): Promise<any> {
    const bed = await this.findOne(bedId);
    
    if (bed.status !== BedStatus.OCCUPIED) {
      throw new BadRequestException('Bed is not currently occupied');
    }

    // Find active allocation
    const activeAllocation = await this.bedAllocationRepository.findOne({
      where: { bedId, actualDischargeDate: null },
    });

    if (!activeAllocation) {
      throw new NotFoundException('No active allocation found for this bed');
    }

    // Update allocation with discharge date
    await this.bedAllocationRepository.update(activeAllocation.id, {
      actualDischargeDate: new Date(),
      notes: deallocationDto.notes || activeAllocation.notes,
    });

    // Update bed status
    await this.bedRepository.update(bedId, { status: BedStatus.AVAILABLE });

    return {
      bedId,
      allocationId: activeAllocation.id,
      dischargeDate: new Date(),
    };
  }

  async getOccupancyHistory(bedId: string, query: any): Promise<BedAllocation[]> {
    return await this.bedAllocationRepository.find({
      where: { bedId },
      relations: ['patient', 'assignedByStaff'],
      order: { allocationDate: 'DESC' },
      take: query.limit || 50,
    });
  }
}