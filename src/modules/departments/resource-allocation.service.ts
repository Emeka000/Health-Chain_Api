import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { Ward } from './entities/ward.entity';

@Injectable()
export class ResourceAllocationService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
  ) {}

  async allocateEquipment(
    departmentId: string,
    equipmentName: string,
    quantity: number,
  ): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
    });
    if (!department) throw new Error('Department not found');
    if (!department.equipment) department.equipment = [];
    const eq = department.equipment.find((e) => e.name === equipmentName);
    if (eq) {
      eq.quantity += quantity;
    } else {
      department.equipment.push({
        name: equipmentName,
        quantity,
        status: 'available',
      });
    }
    return this.departmentRepository.save(department);
  }

  async releaseEquipment(
    departmentId: string,
    equipmentName: string,
    quantity: number,
  ): Promise<Department> {
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
    });
    if (!department) throw new Error('Department not found');
    if (!department.equipment) return department;
    const eq = department.equipment.find((e) => e.name === equipmentName);
    if (eq) {
      eq.quantity = Math.max(0, eq.quantity - quantity);
    }
    return this.departmentRepository.save(department);
  }

  async optimizeEquipmentAllocation(): Promise<any> {
    // Placeholder: implement optimization logic (e.g., based on usage, needs)
    return { message: 'Optimization logic not implemented yet' };
  }
}
