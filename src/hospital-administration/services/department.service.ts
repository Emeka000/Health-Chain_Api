import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Department } from '../entities/department.entity';
import { FilterQuery } from '../interfaces/common.interface';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async create(createDepartmentDto: any): Promise<Department> {
    const existingDepartment = await this.departmentRepository.findOne({
      where: { code: createDepartmentDto.code, hospitalId: createDepartmentDto.hospitalId }
    });

    if (existingDepartment) {
      throw new BadRequestException('Department with this code already exists in this hospital');
    }

    const department = this.departmentRepository.create(createDepartmentDto);
    return await this.departmentRepository.save(department);
  }

  async findAll(query: FilterQuery): Promise<{ data: Department[]; pagination: any }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', search, status } = query;

    const whereConditions: any = {};
    
    if (search) {
      whereConditions.name = Like(`%${search}%`);
    }
    
    if (status) {
      whereConditions.status = status;
    }

    if (query.hospitalId) {
      whereConditions.hospitalId = query.hospitalId;
    }

    const options: FindManyOptions<Department> = {
      where: whereConditions,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['hospital', 'staff', 'beds'],
    };

    const [departments, total] = await this.departmentRepository.findAndCount(options);

    return {
      data: departments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id },
      relations: ['hospital', 'staff', 'beds'],
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  async update(id: string, updateDto: any): Promise<Department> {
    const department = await this.findOne(id);
    
    Object.assign(department, updateDto);
    return await this.departmentRepository.save(department);
  }

  async remove(id: string): Promise<void> {
    const department = await this.findOne(id);
    
    // Check if department has active staff or beds
    if (department.staff?.length > 0 || department.beds?.length > 0) {
      throw new BadRequestException('Cannot delete department with active staff or beds');
    }

    await this.departmentRepository.remove(department);
  }

  async getStats(id: string): Promise<any> {
    const department = await this.findOne(id);

    const totalStaff = department.staff?.length || 0;
    const activeStaff = department.staff?.filter(staff => staff.status === 'active').length || 0;
    const totalBeds = department.beds?.length || 0;
    const occupiedBeds = department.beds?.filter(bed => bed.status === 'occupied').length || 0;
    const availableBeds = department.beds?.filter(bed => bed.status === 'available').length || 0;

    return {
      id: department.id,
      name: department.name,
      totalStaff,
      activeStaff,
      totalBeds,
      occupiedBeds,
      availableBeds,
      bedCapacity: department.bedCapacity,
      utilizationRate: totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0,
    };
  }
}