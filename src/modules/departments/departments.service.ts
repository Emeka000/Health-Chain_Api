import { Injectable, NotFoundException } from '@nestjs/common';
import type { Repository } from 'typeorm';
import type { Department } from './entities/department.entity';
import type { CreateDepartmentDto } from './dto/create-department.dto';
import type { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private departmentsRepository: Repository<Department>) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    const department = this.departmentsRepository.create(createDepartmentDto);
    return this.departmentsRepository.save(department);
  }

  async findAll(): Promise<Department[]> {
    return this.departmentsRepository.find({
      relations: ['shifts', 'assignments'],
    });
  }

  async findOne(id: string): Promise<Department> {
    const department = await this.departmentsRepository.findOne({
      where: { id },
      relations: ['shifts', 'assignments'],
    });

    if (!department) {
      throw new NotFoundException(`Department with ID ${id} not found`);
    }

    return department;
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    const department = await this.findOne(id);
    Object.assign(department, updateDepartmentDto);
    return this.departmentsRepository.save(department);
  }
}
