import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { Ward } from './entities/ward.entity';
import { Room } from './entities/room.entity';
import { Bed, BedStatus } from './entities/bed.entity';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
    @InjectRepository(Ward)
    private readonly wardRepository: Repository<Ward>,
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
    @InjectRepository(Bed)
    private readonly bedRepository: Repository<Bed>,
  ) {}

  async getDepartmentMetrics(departmentId: string) {
    const department = await this.departmentRepository.findOne({
      where: { id: departmentId },
    });
    const wards = await this.wardRepository.find({
      where: { department: { id: departmentId } },
    });
    let totalBeds = 0;
    let occupiedBeds = 0;
    for (const ward of wards) {
      const rooms = await this.roomRepository.find({
        where: { ward: { id: ward.id } },
      });
      for (const room of rooms) {
        const beds = await this.bedRepository.find({
          where: { room: { id: room.id } },
        });
        totalBeds += beds.length;
        occupiedBeds += beds.filter(
          (b) => b.status === BedStatus.OCCUPIED,
        ).length;
      }
    }
    return {
      departmentId,
      departmentName: department?.name,
      totalBeds,
      occupiedBeds,
      availableBeds: totalBeds - occupiedBeds,
      occupancyRate: totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0,
    };
  }
}
