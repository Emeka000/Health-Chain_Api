import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { MedicalStaffService } from './medical-staff.service';
import { Doctor } from '../entities/doctor.entity';
import { MedicalLicense } from '../entities/medical-license.entity';
import { Department } from '../entities/department.entity';
import { Specialty } from '../entities/specialty.entity';
import { CreateContinuingEducationDto } from '../dto/o create-continuing-education.dto';
import { DoctorStatus } from '../enums/doctor-status.enum';
import { LicenseStatus } from '../enums/license-status.enum';
import { ContinuingEducation } from '../entities/continuing-education.entity';
import { CreateDoctorDto } from '../dto/create-doctor.dto';

describe('MedicalStaffService', () => {
  let service: MedicalStaffService;
  let doctorRepository: Repository<Doctor>;
  let licenseRepository: Repository<MedicalLicense>;
  let departmentRepository: Repository<Department>;
  let specialtyRepository: Repository<Specialty>;
  let educationRepository: Repository<CreateContinuingEducationDto>;

  const mockDoctor: Doctor = {
    id: '1',
    employeeId: 'EMP001',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@hospital.com',
    phone: '+1234567890',
    dateOfBirth: new Date('1980-01-01'),
    hireDate: new Date('2020-01-01'),
    status: DoctorStatus.ACTIVE,
    departmentId: '1',
    department: {} as Department,
    specialties: [],
    licenses: [],
    schedules: [],
    performanceMetrics: [],
    continuingEducation: [],
    credentials: {
      medicalSchool: '',
      graduationYear: 0,
      residency: '',
      boardCertifications: [],
    },
    contactInfo: {
      emergencyContact: {
        name: 'Jane Doe',
        relationship: 'Spouse',
        phone: '+1234567891',
      },
      address: {
        street: '123 Main St',
        city: 'Los Angeles',
        state: 'CA',
        zipCode: '90001',
      },
    },
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLicense: MedicalLicense = {
    id: '1',
    doctorId: '1',
    doctor: mockDoctor,
    licenseType: 'Medical License',
    licenseNumber: 'ML123456',
    issuingAuthority: 'State Medical Board',
    issuingState: 'CA',
    issueDate: new Date('2020-01-01'),
    expiryDate: new Date('2025-01-01'),
    renewalDate: new Date('2025-01-01'),
    status: LicenseStatus.ACTIVE,
    restrictions: [],
    verificationDetails: {
      verifiedBy: '',
      verificationDate: new Date(),
      verificationMethod: '',
    },
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedicalStaffService,
        {
          provide: getRepositoryToken(Doctor),
          useValue: {
            create: jest.fn().mockReturnValue(mockDoctor),
            save: jest.fn().mockResolvedValue(mockDoctor),
            findOne: jest.fn().mockResolvedValue(mockDoctor),
            find: jest.fn().mockResolvedValue([mockDoctor]),
            createQueryBuilder: jest.fn().mockReturnValue({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([mockDoctor]),
            }),
          },
        },
        {
          provide: getRepositoryToken(MedicalLicense),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
            find: jest.fn().mockResolvedValue([mockLicense]),
            save: jest.fn().mockResolvedValue(mockLicense),
          },
        },
        {
          provide: getRepositoryToken(Department),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(Specialty),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(ContinuingEducation),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    service = module.get<MedicalStaffService>(MedicalStaffService);
    doctorRepository = module.get<Repository<Doctor>>(
      getRepositoryToken(Doctor),
    );
    licenseRepository = module.get<Repository<MedicalLicense>>(
      getRepositoryToken(MedicalLicense),
    );
    departmentRepository = module.get<Repository<Department>>(
      getRepositoryToken(Department),
    );
    specialtyRepository = module.get<Repository<Specialty>>(
      getRepositoryToken(Specialty),
    );
    educationRepository = module.get<Repository<ContinuingEducation>>(
      getRepositoryToken(ContinuingEducation),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createDoctor', () => {
    it('should create a doctor successfully', async () => {
      const createDoctorDto: CreateDoctorDto = {
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@hospital.com',
        phone: '+1234567890',
        dateOfBirth: new Date('1980-01-01'),
        hireDate: new Date('2020-01-01'),
        departmentId: '1',
      };

      const result = await service.createDoctor(createDoctorDto);
      expect(result).toEqual(mockDoctor);
      expect(doctorRepository.create).toHaveBeenCalled();
      expect(doctorRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if license number already exists', async () => {
      const createDoctorDto: CreateDoctorDto = {
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@hospital.com',
        phone: '+1234567890',
        dateOfBirth: new Date('1980-01-01'),
        hireDate: new Date('2020-01-01'),
        departmentId: '1',
        licenses: [
          {
            licenseType: 'Medical License',
            licenseNumber: 'ML123456',
            issuingAuthority: 'State Medical Board',
            issuingState: 'CA',
            issueDate: new Date('2020-01-01'),
            expiryDate: new Date('2025-01-01'),
          },
        ],
      };

      jest.spyOn(licenseRepository, 'findOne').mockResolvedValue(mockLicense);

      await expect(service.createDoctor(createDoctorDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getDoctor', () => {
    it('should return a doctor if found', async () => {
      const result = await service.getDoctor('1');
      expect(result).toEqual(mockDoctor);
    });

    it('should throw NotFoundException if doctor not found', async () => {
      jest.spyOn(doctorRepository, 'findOne').mockResolvedValue(null);
      await expect(service.getDoctor('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getExpiringLicenses', () => {
    it('should return licenses expiring within specified days', async () => {
      const result = await service.getExpiringLicenses(90);
      expect(result).toEqual([mockLicense]);
      expect(licenseRepository.find).toHaveBeenCalled();
    });
  });

  describe('renewLicense', () => {
    it('should renew a license successfully', async () => {
      jest.spyOn(licenseRepository, 'findOne').mockResolvedValue(mockLicense);
      const newExpiryDate = new Date('2026-01-01');

      const result = await service.renewLicense('1', newExpiryDate);
      expect(result.expiryDate).toEqual(newExpiryDate);
      expect(result.status).toBe(LicenseStatus.ACTIVE);
    });

    it('should throw NotFoundException if license not found', async () => {
      jest.spyOn(licenseRepository, 'findOne').mockResolvedValue(null);
      await expect(service.renewLicense('999', new Date())).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
