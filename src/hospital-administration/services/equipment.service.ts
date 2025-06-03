import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Hospital } from '../entities/hospital.entity';
import { CreateHospitalDto, UpdateHospitalDto } from '../dto/create-hospital.dto';
import { FilterQuery, DashboardStats } from '../interfaces/common.interface';
import { Equipment } from '../entities/equipment.entity';

@Injectable()
export class HospitalService {
  constructor(
    @InjectRepository(Hospital)
    private hospitalRepository: Repository<Hospital>,
    private equipmentRepository:Repository<Equipment>
  ) {}
  async allocateEquipment(deptId: number, name: string, quantity: number) {
    const item = await this.equipmentRepository.findOne({
      where: { department: { id: deptId }, name }
    });
    if (!item || item.quantity < quantity) throw new Error('Not enough equipment');
  
    item.quantity -= quantity;
    return this.equipmentRepository.save(item);
  }
  
}
