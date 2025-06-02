import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions } from 'typeorm';
import { Hospital } from '../entities/hospital.entity';
import { CreateHospitalDto, UpdateHospitalDto } from '../dto/create-hospital.dto';
import { FilterQuery, DashboardStats } from '../interfaces/common.interface';

@Injectable()
export class HospitalService {
  constructor(
    @InjectRepository(Hospital)
    private hospitalRepository: Repository<Hospital>,
  ) {}

  async create(createHospitalDto: CreateHospitalDto): Promise<Hospital> {
    const existingHospital = await this.hospitalRepository.findOne({
      where: [
        { name: createHospitalDto.name },
        { licenseNumber: createHospitalDto.licenseNumber }
      ]
    });

    if (existingHospital) {
      throw new BadRequestException('Hospital with this name or license number already exists');
    }

    const hospital = this.hospitalRepository.create(createHospitalDto);
    return await this.hospitalRepository.save(hospital);
  }

  async findAll(query: FilterQuery): Promise<{ data: Hospital[]; pagination: any }> {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'DESC', search, status } = query;

    const whereConditions: any = {};
    
    if (search) {
      whereConditions.name = Like(`%${search}%`);
    }
    
    if (status) {
      whereConditions.status = status;
    }

    const options: FindManyOptions<Hospital> = {
      where: whereConditions,
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['departments', 'staff', 'beds'],
    };

    const [hospitals, total] = await this.hospitalRepository.findAndCount(options);

    return {
      data: hospitals,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Hospital> {
    const hospital = await this.hospitalRepository.findOne({
      where: { id },
      relations: ['departments', 'staff', 'beds'],
    });

    if (!hospital) {
      throw new NotFoundException('Hospital not found');
    }

    return hospital;
  }

  async update(id: string, updateHospitalDto: UpdateHospitalDto): Promise<Hospital> {
    const hospital = await this.findOne(id);
    
    Object.assign(hospital, updateHospitalDto);
    return await this.hospitalRepository.save(hospital);
  }

  async remove(id: string): Promise<void> {
    const hospital = await this.findOne(id);
    await this.hospitalRepository.remove(hospital);
  }

  async getDashboardStats(hospitalId: string): Promise<DashboardStats> {
    const hospital = await this.findOne(hospitalId);

    // Get total patients (would need Patient entity relationship)
    const totalPatients = 150; // Placeholder

    // Get bed statistics
    const totalBeds = hospital.totalBeds;
    const occupiedBeds = hospital.beds?.filter(bed => bed.status === 'occupied').length || 0;
    const occupancyRate = totalBeds > 0 ? (occupiedBeds / totalBeds) * 100 : 0;

    // Get staff statistics
    const totalStaff = hospital.staff?.length || 0;
    const activeStaff = hospital.staff?.filter(staff => staff.status === 'active').length || 0;

    // Get financial data (would need integration with billing)
    const totalRevenue = 125000; // Placeholder
    const pendingBills = 25; // Placeholder

    return {
      totalPatients,
      occupiedBeds,
      totalBeds,
      occupancyRate,
      totalStaff,
      activeStaff,
      totalRevenue,
      pendingBills,
    };
  }
}
