import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import { Ward } from './entities/ward.entity';
import { Room } from './entities/room.entity';
import { Bed, BedStatus } from './entities/bed.entity';

@Injectable()
export class DepartmentWorkflowService {
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

  async admitPatientToBed(
    bedId: string,
    patientId: string,
  ): Promise<Bed | null> {
    await this.bedRepository.update(bedId, {
      status: BedStatus.OCCUPIED,
      assignedPatientId: patientId,
    });
    return this.bedRepository.findOne({ where: { id: bedId } });
  }

  async dischargePatientFromBed(bedId: string): Promise<Bed | null> {
    await this.bedRepository.update(bedId, {
      status: BedStatus.AVAILABLE,
      assignedPatientId: null,
    });
    return this.bedRepository.findOne({ where: { id: bedId } });
  }

  async transferPatient(
    bedIdFrom: string,
    bedIdTo: string,
    patientId: string,
  ): Promise<{ from: Bed | null; to: Bed | null }> {
    await this.bedRepository.update(bedIdFrom, {
      status: BedStatus.AVAILABLE,
      assignedPatientId: null,
    });
    await this.bedRepository.update(bedIdTo, {
      status: BedStatus.OCCUPIED,
      assignedPatientId: patientId,
    });
    const from = await this.bedRepository.findOne({ where: { id: bedIdFrom } });
    const to = await this.bedRepository.findOne({ where: { id: bedIdTo } });
    return { from, to };
  }
}
