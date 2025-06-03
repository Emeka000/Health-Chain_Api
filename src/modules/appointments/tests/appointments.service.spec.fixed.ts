import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppointmentsService } from '../services/appointments.service';
import { Appointment } from '../entities/appointment.entity';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { AppointmentType } from '../enums/appointment-type.enum';
import { MedicalPriority } from '../enums/medical-priority.enum';
import { ProviderAvailabilityService } from '../services/provider-availability.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

// Extended interfaces for testing
interface MockProviderAvailabilityService
  extends Partial<ProviderAvailabilityService> {
  checkProviderAvailability: jest.Mock;
}

interface ExtendedAppointmentsService extends AppointmentsService {
  cancel(id: string, reason: string, cancelledBy: string): Promise<Appointment>;
}

// Fix generic type constraint
type MockRepository<T extends object = any> = Partial<
  Record<keyof Repository<T>, jest.Mock>
>;
const createMockRepository = <T extends object>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

// No duplicate interface needed

describe('AppointmentsService', () => {
  let service: ExtendedAppointmentsService;
  let appointmentRepository: MockRepository<Appointment>;
  let providerAvailabilityService: MockProviderAvailabilityService;

  beforeEach(async () => {
    providerAvailabilityService = {
      checkProviderAvailability: jest.fn().mockResolvedValue(true),
      findAvailableProvidersBySpecialty: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        {
          provide: getRepositoryToken(Appointment),
          useFactory: createMockRepository,
        },
        {
          provide: ProviderAvailabilityService,
          useValue: providerAvailabilityService,
        },
      ],
    }).compile();

    service = module.get<ExtendedAppointmentsService>(AppointmentsService);
    appointmentRepository = module.get(getRepositoryToken(Appointment));
  });

  describe('create', () => {
    it('should create a new appointment successfully', async () => {
      const createAppointmentDto: CreateAppointmentDto = {
        patientId: 'patient-id',
        providerId: 'provider-id',
        startDateTime: '2025-06-01T09:00:00.000Z',
        endDateTime: '2025-06-01T10:00:00.000Z',
        appointmentType: AppointmentType.ROUTINE,
        medicalPriority: MedicalPriority.MEDIUM,
        notes: 'Initial consultation',
        reason: 'Annual check-up',
        isTelemedicine: false,
      };

      const expectedAppointment = {
        ...createAppointmentDto,
        id: 'appointment-id',
        status: AppointmentStatus.BOOKED,
        confirmationNumber: expect.any(String),
      };

      appointmentRepository.create?.mockReturnValue(
        expectedAppointment as unknown as Appointment,
      );
      appointmentRepository.save?.mockResolvedValue(
        expectedAppointment as unknown as Appointment,
      );

      const result = await service.create(createAppointmentDto);

      expect(appointmentRepository.create).toHaveBeenCalledWith({
        ...createAppointmentDto,
        status: AppointmentStatus.BOOKED,
        confirmationNumber: expect.any(String),
      });
      expect(appointmentRepository.save).toHaveBeenCalledWith(
        expectedAppointment,
      );
      expect(result).toEqual(expectedAppointment);
      expect(result.confirmationNumber).toBeDefined();
    });

    it('should throw ConflictException when provider is not available', async () => {
      const createAppointmentDto: CreateAppointmentDto = {
        patientId: 'patient-id',
        providerId: 'provider-id',
        startDateTime: '2025-06-01T09:00:00.000Z',
        endDateTime: '2025-06-01T10:00:00.000Z',
        appointmentType: AppointmentType.ROUTINE,
        medicalPriority: MedicalPriority.MEDIUM,
        notes: 'Initial consultation',
        reason: 'Annual check-up',
        isTelemedicine: false,
      };

      providerAvailabilityService.checkProviderAvailability.mockResolvedValue(
        false,
      );

      await expect(service.create(createAppointmentDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all appointments when no filters are provided', async () => {
      const expectedAppointments = [
        { id: 'appointment-1' },
        { id: 'appointment-2' },
      ];

      appointmentRepository.find?.mockResolvedValue(
        expectedAppointments as unknown as Appointment[],
      );

      const result = await service.findAll({});

      expect(appointmentRepository.find).toHaveBeenCalledWith({
        where: { isActive: true },
        order: { startDateTime: 'ASC' },
      });
      expect(result).toEqual(expectedAppointments);
    });

    it('should apply filters when provided', async () => {
      const filters = {
        patientId: 'patient-id',
        providerId: 'provider-id',
        status: AppointmentStatus.BOOKED,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-30'),
      };

      const expectedAppointments = [{ id: 'appointment-1' }];

      appointmentRepository.find?.mockResolvedValue(
        expectedAppointments as unknown as Appointment[],
      );

      const result = await service.findAll(filters);

      expect(appointmentRepository.find).toHaveBeenCalledWith({
        where: {
          isActive: true,
          patientId: filters.patientId,
          providerId: filters.providerId,
          status: filters.status,
          startDateTime: expect.any(Object),
          endDateTime: expect.any(Object),
        },
        order: { startDateTime: 'ASC' },
      });
      expect(result).toEqual(expectedAppointments);
    });
  });

  describe('findOne', () => {
    it('should return an appointment when it exists', async () => {
      const appointmentId = 'appointment-id';
      const expectedAppointment = { id: appointmentId };

      appointmentRepository.findOne?.mockResolvedValue(
        expectedAppointment as unknown as Appointment,
      );

      const result = await service.findOne(appointmentId);

      expect(appointmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: appointmentId, isActive: true },
      });
      expect(result).toEqual(expectedAppointment);
    });

    it('should throw NotFoundException when appointment does not exist', async () => {
      const appointmentId = 'non-existent-id';

      appointmentRepository.findOne?.mockResolvedValue(null);

      await expect(service.findOne(appointmentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an appointment successfully', async () => {
      const appointmentId = 'appointment-id';
      const updateAppointmentDto: UpdateAppointmentDto = {
        status: AppointmentStatus.CHECKED_IN,
        notes: 'Patient arrived early',
      };

      const existingAppointment = {
        id: appointmentId,
        status: AppointmentStatus.BOOKED,
      };

      const updatedAppointment = {
        ...existingAppointment,
        ...updateAppointmentDto,
      };

      appointmentRepository.findOne?.mockResolvedValue(
        existingAppointment as unknown as Appointment,
      );
      appointmentRepository.save?.mockResolvedValue(
        updatedAppointment as unknown as Appointment,
      );

      const result = await service.update(appointmentId, updateAppointmentDto);

      expect(appointmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: appointmentId, isActive: true },
      });
      expect(appointmentRepository.save).toHaveBeenCalledWith({
        ...existingAppointment,
        ...updateAppointmentDto,
      });
      expect(result).toEqual(updatedAppointment);
    });

    it('should throw NotFoundException when appointment does not exist', async () => {
      const appointmentId = 'non-existent-id';
      const updateAppointmentDto: UpdateAppointmentDto = {
        status: AppointmentStatus.CHECKED_IN,
      };

      appointmentRepository.findOne?.mockResolvedValue(null);

      await expect(
        service.update(appointmentId, updateAppointmentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancel', () => {
    it('should cancel an appointment successfully', async () => {
      const appointmentId = 'appointment-id';
      const cancellationReason = 'Patient request';
      const cancelledBy = 'user-id';

      const existingAppointment = {
        id: appointmentId,
        status: AppointmentStatus.BOOKED,
      };

      const cancelledAppointment = {
        ...existingAppointment,
        status: AppointmentStatus.CANCELLED,
        cancellationReason,
        cancelledBy,
        cancellationDate: expect.any(Date),
      };

      appointmentRepository.findOne?.mockResolvedValue(
        existingAppointment as unknown as Appointment,
      );
      appointmentRepository.save?.mockResolvedValue(
        cancelledAppointment as unknown as Appointment,
      );

      const result = await service.cancel(
        appointmentId,
        cancellationReason,
        cancelledBy,
      );

      expect(appointmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: appointmentId, isActive: true },
      });
      expect(appointmentRepository.save).toHaveBeenCalledWith({
        ...existingAppointment,
        status: AppointmentStatus.CANCELLED,
        cancellationReason,
        cancelledBy,
        cancellationDate: expect.any(Date),
      });
      expect(result).toEqual(cancelledAppointment);
    });

    it('should throw NotFoundException when appointment does not exist', async () => {
      const appointmentId = 'non-existent-id';
      const cancellationReason = 'Patient request';
      const cancelledBy = 'user-id';

      appointmentRepository.findOne?.mockResolvedValue(null);

      await expect(
        service.cancel(appointmentId, cancellationReason, cancelledBy),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateStatus', () => {
    it('should update appointment status successfully', async () => {
      const appointmentId = 'appointment-id';
      const newStatus = AppointmentStatus.IN_PROGRESS;

      const existingAppointment = {
        id: appointmentId,
        status: AppointmentStatus.CHECKED_IN,
      };

      const updatedAppointment = {
        ...existingAppointment,
        status: newStatus,
      };

      appointmentRepository.findOne?.mockResolvedValue(
        existingAppointment as unknown as Appointment,
      );
      appointmentRepository.save?.mockResolvedValue(
        updatedAppointment as unknown as Appointment,
      );

      const result = await service.updateStatus(appointmentId, newStatus);

      expect(appointmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: appointmentId, isActive: true },
      });
      expect(appointmentRepository.save).toHaveBeenCalledWith({
        ...existingAppointment,
        status: newStatus,
      });
      expect(result).toEqual(updatedAppointment);
    });

    it('should throw NotFoundException when appointment does not exist', async () => {
      const appointmentId = 'non-existent-id';
      const newStatus = AppointmentStatus.IN_PROGRESS;

      appointmentRepository.findOne?.mockResolvedValue(null);

      await expect(
        service.updateStatus(appointmentId, newStatus),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('markReminderSent', () => {
    it('should mark reminder as sent successfully', async () => {
      const appointmentId = 'appointment-id';

      const existingAppointment = {
        id: appointmentId,
        reminderSent: false,
      };

      const updatedAppointment = {
        ...existingAppointment,
        reminderSent: true,
        reminderSentAt: expect.any(Date),
      };

      appointmentRepository.findOne?.mockResolvedValue(
        existingAppointment as unknown as Appointment,
      );
      appointmentRepository.save?.mockResolvedValue(
        updatedAppointment as unknown as Appointment,
      );

      const result = await service.markReminderSent(appointmentId);

      expect(appointmentRepository.findOne).toHaveBeenCalledWith({
        where: { id: appointmentId, isActive: true },
      });
      expect(appointmentRepository.save).toHaveBeenCalledWith({
        ...existingAppointment,
        reminderSent: true,
        reminderSentAt: expect.any(Date),
      });
      expect(result).toEqual(updatedAppointment);
    });

    it('should throw NotFoundException when appointment does not exist', async () => {
      const appointmentId = 'non-existent-id';

      appointmentRepository.findOne?.mockResolvedValue(null);

      await expect(service.markReminderSent(appointmentId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
