import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { MedicalLicense } from '../entities/medical-license.entity';
import { Department } from '../entities/department.entity';
import { Specialty } from '../entities/specialty.entity';
import { CreateContinuingEducationDto } from '../dto/o create-continuing-education.dto';
import { CreateDoctorDto } from '../dto/create-doctor.dto';
import { DoctorStatus } from '../enums/doctor-status.enum';
import { UpdateDoctorDto } from '../dto/update-doctor.dto';
import { LicenseStatus } from '../enums/license-status.enum';
import { CreateDepartmentDto } from '../dto/create-department.dto';
import { CreateSpecialtyDto } from '../dto/create-specialty.dto';

@Injectable()
export class MedicalStaffService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(MedicalLicense)
    private licenseRepository: Repository<MedicalLicense>,
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
    @InjectRepository(Specialty)
    private specialtyRepository: Repository<Specialty>,
    @InjectRepository(CreateContinuingEducationDto)
    private educationRepository: Repository<CreateContinuingEducationDto>,
  ) {}

  // Doctor Management
  async createDoctor(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    // Check if doctor with same license number already exists
    if (createDoctorDto.licenses) {
      for (const license of createDoctorDto.licenses) {
        const existingLicense = await this.licenseRepository.findOne({
          where: { licenseNumber: license.licenseNumber },
        });
        if (existingLicense) {
          throw new ConflictException(
            `License number ${license.licenseNumber} already exists`,
          );
        }
      }
    }

    const doctor = this.doctorRepository.create({
      ...createDoctorDto,
      status: DoctorStatus.ACTIVE,
    });

    return this.doctorRepository.save(doctor);
  }

  async getDoctors(filters: {
    departmentId?: string;
    specialtyId?: string;
    status?: string;
  }): Promise<Doctor[]> {
    const query = this.doctorRepository
      .createQueryBuilder('doctor')
      .leftJoinAndSelect('doctor.department', 'department')
      .leftJoinAndSelect('doctor.specialties', 'specialties')
      .leftJoinAndSelect('doctor.licenses', 'licenses');

    if (filters.departmentId) {
      query.andWhere('doctor.departmentId = :departmentId', {
        departmentId: filters.departmentId,
      });
    }

    if (filters.specialtyId) {
      query.andWhere('specialties.id = :specialtyId', {
        specialtyId: filters.specialtyId,
      });
    }

    if (filters.status) {
      query.andWhere('doctor.status = :status', { status: filters.status });
    }

    return query.getMany();
  }

  async getDoctor(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({
      where: { id },
      relations: [
        'department',
        'specialties',
        'licenses',
        'schedules',
        'performanceMetrics',
        'continuingEducation',
      ],
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }

  async updateDoctor(
    id: string,
    updateDoctorDto: UpdateDoctorDto,
  ): Promise<Doctor> {
    const doctor = await this.getDoctor(id);
    Object.assign(doctor, updateDoctorDto);
    return this.doctorRepository.save(doctor);
  }

  async deactivateDoctor(id: string): Promise<Doctor> {
    const doctor = await this.getDoctor(id);
    doctor.status = DoctorStatus.INACTIVE;
    return this.doctorRepository.save(doctor);
  }

  // License Management
  async getDoctorLicenses(doctorId: string): Promise<MedicalLicense[]> {
    return this.licenseRepository.find({
      where: { doctorId },
      order: { expiryDate: 'ASC' },
    });
  }

  async getExpiringLicenses(days = 90): Promise<MedicalLicense[]> {
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + days);

    return this.licenseRepository.find({
      where: {
        expiryDate: LessThan(expiryThreshold),
        status: LicenseStatus.ACTIVE,
      },
      relations: ['doctor'],
      order: { expiryDate: 'ASC' },
    });
  }

  async renewLicense(
    licenseId: string,
    newExpiryDate: Date,
  ): Promise<MedicalLicense> {
    const license = await this.licenseRepository.findOne({
      where: { id: licenseId },
    });

    if (!license) {
      throw new NotFoundException('License not found');
    }

    license.expiryDate = newExpiryDate;
    license.status = LicenseStatus.ACTIVE;
    license.renewalDate = new Date();

    return this.licenseRepository.save(license);
  }

  // Continuing Education
  async recordContinuingEducation(
    createEducationDto: CreateContinuingEducationDto,
  ): Promise<CreateContinuingEducationDto> {
    const education = this.educationRepository.create(createEducationDto);
    return this.educationRepository.save(education);
  }

  async getDoctorEducationCredits(
    doctorId: string,
  ): Promise<CreateContinuingEducationDto[]> {
    return this.educationRepository.find({
      where: { doctorId },
      order: { completionDate: 'DESC' },
    });
  }

  async getEducationCompliance(): Promise<{
    compliant: Doctor[];
    nonCompliant: Doctor[];
    summary: {
      totalDoctors: number;
      compliantCount: number;
      nonCompliantCount: number;
      complianceRate: number;
    };
  }> {
    const doctors = await this.doctorRepository.find({
      where: { status: DoctorStatus.ACTIVE },
      relations: ['continuingEducation'],
    });

    const currentYear = new Date().getFullYear();
    const requiredCredits = 50; // CME credits required per year

    const compliant: Doctor[] = [];
    const nonCompliant: Doctor[] = [];

    for (const doctor of doctors) {
      const yearCredits = doctor.continuingEducation
        .filter((edu) => edu.completionDate.getFullYear() === currentYear)
        .reduce((sum, edu) => sum + edu.credits, 0);

      if (yearCredits >= requiredCredits) {
        compliant.push(doctor);
      } else {
        nonCompliant.push(doctor);
      }
    }

    return {
      compliant,
      nonCompliant,
      summary: {
        totalDoctors: doctors.length,
        compliantCount: compliant.length,
        nonCompliantCount: nonCompliant.length,
        complianceRate:
          doctors.length > 0 ? (compliant.length / doctors.length) * 100 : 0,
      },
    };
  }

  // Department and Specialty Management
  async createDepartment(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<Department> {
    const department = this.departmentRepository.create(createDepartmentDto);
    return this.departmentRepository.save(department);
  }

  async getDepartments(): Promise<Department[]> {
    return this.departmentRepository.find({
      relations: ['doctors'],
      order: { name: 'ASC' },
    });
  }

  async createSpecialty(
    createSpecialtyDto: CreateSpecialtyDto,
  ): Promise<Specialty> {
    const specialty = this.specialtyRepository.create(createSpecialtyDto);
    return this.specialtyRepository.save(specialty);
  }

  async getSpecialties(): Promise<Specialty[]> {
    return this.specialtyRepository.find({
      order: { name: 'ASC' },
    });
  }
}
