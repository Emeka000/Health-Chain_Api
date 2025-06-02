import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Staff } from '../entities/staff.entity';
import { FilterQuery } from '../interfaces/common.interface';

@Injectable()
export class StaffService {
  constructor(
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  async create(createStaffDto: any): Promise<Staff> {
    const existingStaff = await this.staffRepository.findOne({
      where: [
        { employeeId: createStaffDto.employeeId },
        { email: createStaffDto.email }
      ]
    });

    if (existingStaff) {
      throw new BadRequestException('Staff with this employee ID or email already exists');
    }

    const staff = this.staffRepository.create(createStaffDto);
    return await this.staffRepository.save(staff);
  }

  async findAll(query: FilterQuery): Promise<{ data: Staff[]; pagination: any }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', search, status } = query;

    const whereConditions: any = {};
    
    if (search) {
      whereConditions.firstName = Like(`%${search}%`);
    }
    
    if (status) {
      whereConditions.status = status;
    }

    if (query.departmentId) {
      whereConditions.departmentId = query.departmentId;
    }

    const options: FindManyOptions<Staff> = {
      where: whereConditions,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['hospital', 'department'],
    };

    const [staff, total] = await this.staffRepository.findAndCount(options);

    return {
      data: staff,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Staff> {
    const staff = await this.staffRepository.findOne({
      where: { id },
      relations: ['hospital', 'department'],
    });

    if (!staff) {
      throw new NotFoundException('Staff member not found');
    }

    return staff;
  }

  async update(id: string, updateDto: any): Promise<Staff> {
    const staff = await this.findOne(id);
    
    Object.assign(staff, updateDto);
    return await this.staffRepository.save(staff);
  }

  async remove(id: string): Promise<void> {
    const staff = await this.findOne(id);
    await this.staffRepository.remove(staff);
  }

  async createSchedule(staffId: string, scheduleDto: any): Promise<any> {
    const staff = await this.findOne(staffId);
    
    // In a real implementation, this would create a schedule entity
    // For now, we'll return a mock schedule
    return {
      staffId: staff.id,
      staffName: `${staff.firstName} ${staff.lastName}`,
      schedule: scheduleDto,
      createdAt: new Date(),
    };
  }

  async getSchedule(staffId: string, query: any): Promise<any> {
    const staff = await this.findOne(staffId);
    
    // In a real implementation, this would fetch from a schedule entity
    return {
      staffId: staff.id,
      staffName: `${staff.firstName} ${staff.lastName}`,
      schedules: [
        {
          date: '2024-01-15',
          startTime: '08:00',
          endTime: '16:00',
          shift: 'day',
          department: staff.department.name,
        },
        {
          date: '2024-01-16',
          startTime: '16:00',
          endTime: '00:00',
          shift: 'evening',
          department: staff.department.name,
        },
      ],
    };
  }
}
