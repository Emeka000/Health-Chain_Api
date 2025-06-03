import { Test, type TestingModule } from '@nestjs/testing';
import { MedicalStaffController } from './medical-staff.controller';
import { MedicalStaffService } from '../providers/medical-staff.service';
import { SchedulingService } from '../providers/scheduling.service';
import { PerformanceTrackingService } from '../providers/performance-tracking.service';
import { DoctorStatus } from '../enums/doctor-status.enum';
import { ScheduleType } from '../enums/schedule-type.enum';
import { CreateDoctorDto } from '../dto/create-doctor.dto';
import { CreateScheduleDto } from '../dto/create-schedule.dto';

describe('MedicalStaffController', () => {
  let controller: MedicalStaffController;
  let medicalStaffService: MedicalStaffService;
  let schedulingService: SchedulingService;
  let performanceTrackingService: PerformanceTrackingService;

  const mockDoctor = {
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
  };

  const mockSchedule = {
    id: '1',
    doctorId: '1',
    scheduleType: ScheduleType.APPOINTMENT,
    startTime: new Date(),
    endTime: new Date(),
    location: 'Room 101',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MedicalStaffController],
      providers: [
        {
          provide: MedicalStaffService,
          useValue: {
            createDoctor: jest.fn().mockResolvedValue(mockDoctor),
            getDoctors: jest.fn().mockResolvedValue([mockDoctor]),
            getDoctor: jest.fn().mockResolvedValue(mockDoctor),
            updateDoctor: jest.fn().mockResolvedValue(mockDoctor),
            deactivateDoctor: jest.fn().mockResolvedValue(mockDoctor),
            getDoctorLicenses: jest.fn().mockResolvedValue([]),
            getExpiringLicenses: jest.fn().mockResolvedValue([]),
            renewLicense: jest.fn().mockResolvedValue({}),
            recordContinuingEducation: jest.fn().mockResolvedValue({}),
            getDoctorEducationCredits: jest.fn().mockResolvedValue([]),
            getEducationCompliance: jest.fn().mockResolvedValue({}),
            createDepartment: jest.fn().mockResolvedValue({}),
            getDepartments: jest.fn().mockResolvedValue([]),
            createSpecialty: jest.fn().mockResolvedValue({}),
            getSpecialties: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: SchedulingService,
          useValue: {
            createSchedule: jest.fn().mockResolvedValue(mockSchedule),
            getSchedules: jest.fn().mockResolvedValue([mockSchedule]),
            checkAvailability: jest.fn().mockResolvedValue({
              available: true,
              conflicts: [],
              suggestions: [],
            }),
            getSchedulingConflicts: jest
              .fn()
              .mockResolvedValue({ conflicts: [], summary: {} }),
          },
        },
        {
          provide: PerformanceTrackingService,
          useValue: {
            createPerformanceMetric: jest.fn().mockResolvedValue({}),
            getDoctorPerformance: jest.fn().mockResolvedValue({}),
            getDepartmentPerformanceSummary: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    controller = module.get<MedicalStaffController>(MedicalStaffController);
    medicalStaffService = module.get<MedicalStaffService>(MedicalStaffService);
    schedulingService = module.get<SchedulingService>(SchedulingService);
    performanceTrackingService = module.get<PerformanceTrackingService>(
      PerformanceTrackingService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createDoctor', () => {
    it('should create a doctor', async () => {
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

      const result = await controller.createDoctor(createDoctorDto);
      expect(result).toEqual(mockDoctor);
      expect(medicalStaffService.createDoctor).toHaveBeenCalledWith(
        createDoctorDto,
      );
    });
  });

  describe('getDoctors', () => {
    it('should get all doctors', async () => {
      const result = await controller.getDoctors();
      expect(result).toEqual([mockDoctor]);
      expect(medicalStaffService.getDoctors).toHaveBeenCalled();
    });
  });

  describe('createSchedule', () => {
    it('should create a schedule', async () => {
      const createScheduleDto: CreateScheduleDto = {
        doctorId: '1',
        scheduleType: ScheduleType.APPOINTMENT,
        startTime: new Date(),
        endTime: new Date(),
      };

      const result = await controller.createSchedule(createScheduleDto);
      expect(result).toEqual(mockSchedule);
      expect(schedulingService.createSchedule).toHaveBeenCalledWith(
        createScheduleDto,
      );
    });
  });

  describe('checkAvailability', () => {
    it('should check doctor availability', async () => {
      const result = await controller.checkAvailability(
        '1',
        new Date(),
        '09:00',
        '10:00',
      );
      expect(result.available).toBe(true);
      expect(schedulingService.checkAvailability).toHaveBeenCalled();
    });
  });
});
