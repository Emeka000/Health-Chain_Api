import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import type { Nurse } from './entities/nurse.entity';
import type { CreateNurseDto } from './dto/create-nurse.dto';
import type { UpdateNurseDto } from './dto/update-nurse.dto';
import type { CertificationType, SpecialtyType } from '../../common/enums';

@Injectable()
export class NursesService {
  constructor(private nursesRepository: Repository<Nurse>) {}

  async create(createNurseDto: CreateNurseDto): Promise<Nurse> {
    const existingNurse = await this.nursesRepository.findOne({
      where: [
        { employeeId: createNurseDto.employeeId },
        { email: createNurseDto.email },
      ],
    });

    if (existingNurse) {
      throw new ConflictException('Employee ID or email already exists');
    }

    const hashedPassword = await bcrypt.hash(createNurseDto.password, 10);

    const nurse = this.nursesRepository.create({
      ...createNurseDto,
      password: hashedPassword,
      hireDate: new Date(createNurseDto.hireDate),
      licenseExpiryDate: createNurseDto.licenseExpiryDate
        ? new Date(createNurseDto.licenseExpiryDate)
        : null,
    });

    return this.nursesRepository.save(nurse);
  }

  async findAll(filters?: {
    role?: string;
    specialty?: SpecialtyType;
    certification?: CertificationType;
    isActive?: boolean;
  }): Promise<Nurse[]> {
    const query = this.nursesRepository.createQueryBuilder('nurse');

    if (filters?.role) {
      query.andWhere('nurse.role = :role', { role: filters.role });
    }

    if (filters?.specialty) {
      query.andWhere(':specialty = ANY(nurse.specialties)', {
        specialty: filters.specialty,
      });
    }

    if (filters?.certification) {
      query.andWhere(':certification = ANY(nurse.certifications)', {
        certification: filters.certification,
      });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('nurse.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Nurse> {
    const nurse = await this.nursesRepository.findOne({
      where: { id },
      relations: ['shifts', 'assignments', 'qualityMetrics'],
    });

    if (!nurse) {
      throw new NotFoundException(`Nurse with ID ${id} not found`);
    }

    return nurse;
  }

  async findByEmail(email: string): Promise<Nurse> {
    return this.nursesRepository.findOne({ where: { email } });
  }

  async update(id: string, updateNurseDto: UpdateNurseDto): Promise<Nurse> {
    const nurse = await this.findOne(id);

    if (updateNurseDto.password) {
      updateNurseDto.password = await bcrypt.hash(updateNurseDto.password, 10);
    }

    if (updateNurseDto.hireDate) {
      updateNurseDto.hireDate = new Date(updateNurseDto.hireDate) as any;
    }

    if (updateNurseDto.licenseExpiryDate) {
      updateNurseDto.licenseExpiryDate = new Date(
        updateNurseDto.licenseExpiryDate,
      ) as any;
    }

    Object.assign(nurse, updateNurseDto);
    return this.nursesRepository.save(nurse);
  }

  async findAvailableNurses(
    shiftDate: Date,
    specialty?: SpecialtyType,
    certification?: CertificationType,
  ): Promise<Nurse[]> {
    const query = this.nursesRepository
      .createQueryBuilder('nurse')
      .leftJoin(
        'nurse.shifts',
        'shift',
        'DATE(shift.startTime) = DATE(:shiftDate)',
        { shiftDate },
      )
      .where('nurse.isActive = true')
      .andWhere('shift.id IS NULL');

    if (specialty) {
      query.andWhere(':specialty = ANY(nurse.specialties)', { specialty });
    }

    if (certification) {
      query.andWhere(':certification = ANY(nurse.certifications)', {
        certification,
      });
    }

    return query.getMany();
  }
}
