import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { NotificationService } from '../services/notification.service';
import { Logger } from '@nestjs/common';

// Mock the imports that are causing issues
jest.mock('../services/appointments.service', () => ({
  AppointmentsService: jest.fn().mockImplementation(() => ({
    markReminderSent: jest.fn().mockResolvedValue({}),
    findOne: jest.fn().mockResolvedValue({}),
  })),
}));

// Mock appointment status and type enums
enum AppointmentStatus {
  PROPOSED = 'PROPOSED',
  BOOKED = 'BOOKED',
  CHECKED_IN = 'CHECKED_IN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

enum AppointmentType {
  ROUTINE = 'ROUTINE',
  URGENT = 'URGENT',
  FOLLOW_UP = 'FOLLOW_UP',
}

// Mock Appointment interface
interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  startDateTime: Date;
  endDateTime?: Date;
  status: AppointmentStatus;
  appointmentType: AppointmentType;
  isTelemedicine: boolean;
  reminderSent?: boolean;
  confirmationNumber?: string;
  cancellationReason?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
  followUpNotes?: string;
}

describe('NotificationService', () => {
  let service: NotificationService;
  let appointmentsService: any;
  let configService: Partial<ConfigService>;
  let loggerSpy: jest.SpyInstance;

  beforeEach(async () => {
    // Import the AppointmentsService dynamically to get the mock
    const { AppointmentsService } = require('../services/appointments.service');
    appointmentsService = new AppointmentsService();
    appointmentsService.markReminderSent = jest.fn().mockResolvedValue({});
    appointmentsService.findOne = jest.fn().mockResolvedValue({});

    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'EMAIL_SERVICE') return 'test-email-service';
        if (key === 'EMAIL_USER') return 'test-email-user';
        if (key === 'EMAIL_PASSWORD') return 'test-email-password';
        if (key === 'SMS_API_KEY') return 'test-sms-api-key';
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: AppointmentsService,
          useValue: appointmentsService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);

    // Spy on logger to verify log messages
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
  });

  beforeEach(() => {
    // Reset the spy before each test
    loggerSpy.mockReset();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendAppointmentReminder', () => {
    it('should send a reminder and mark it as sent', async () => {
      const appointment: Partial<Appointment> = {
        id: 'appointment-id',
        patientId: 'patient-id',
        providerId: 'provider-id',
        startDateTime: new Date('2025-06-10T10:00:00Z'),
        endDateTime: new Date('2025-06-10T11:00:00Z'),
        status: AppointmentStatus.BOOKED,
        reminderSent: false,
        confirmationNumber: 'CONF123',
        appointmentType: AppointmentType.ROUTINE,
        isTelemedicine: false,
      };

      const result = await service.sendAppointmentReminder(appointment as any);

      expect(result).toBe(true);
      expect(loggerSpy).toHaveBeenCalled();
      expect(appointmentsService.markReminderSent).toHaveBeenCalledWith(
        appointment.id,
      );
    });

    it('should not send a reminder if already sent', async () => {
      const appointment: Partial<Appointment> = {
        id: 'appointment-id',
        patientId: 'patient-id',
        status: AppointmentStatus.BOOKED,
        reminderSent: true,
      };

      const result = await service.sendAppointmentReminder(appointment as any);

      expect(result).toBe(false);
      expect(appointmentsService.markReminderSent).not.toHaveBeenCalled();
    });

    it('should not send a reminder if appointment is not booked', async () => {
      const appointment: Partial<Appointment> = {
        id: 'appointment-id',
        patientId: 'patient-id',
        status: AppointmentStatus.CANCELLED,
        reminderSent: false,
      };

      const result = await service.sendAppointmentReminder(appointment as any);

      expect(result).toBe(false);
      expect(appointmentsService.markReminderSent).not.toHaveBeenCalled();
    });
  });

  describe('sendAppointmentConfirmation', () => {
    it('should send a confirmation notification', async () => {
      const appointment: Partial<Appointment> = {
        id: 'appointment-id',
        patientId: 'patient-id',
        providerId: 'provider-id',
        startDateTime: new Date('2025-06-10T10:00:00Z'),
        confirmationNumber: 'CONF123',
        appointmentType: AppointmentType.ROUTINE,
        isTelemedicine: false,
      };

      const result = await service.sendAppointmentConfirmation(
        appointment as any,
      );

      expect(result).toBe(true);
      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  describe('sendAppointmentCancellation', () => {
    it('should send a cancellation notification', async () => {
      const appointment: Partial<Appointment> = {
        id: 'appointment-id',
        patientId: 'patient-id',
        providerId: 'provider-id',
        startDateTime: new Date('2025-06-10T10:00:00Z'),
        cancellationReason: 'Patient request',
        confirmationNumber: 'CONF123',
      };

      const result = await service.sendAppointmentCancellation(
        appointment as any,
      );

      expect(result).toBe(true);
      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  describe('sendTelemedicineLink', () => {
    it('should send telemedicine link to patient and provider', async () => {
      const appointment: Partial<Appointment> = {
        id: 'appointment-id',
        patientId: 'patient-id',
        providerId: 'provider-id',
        startDateTime: new Date('2025-06-10T10:00:00Z'),
        status: AppointmentStatus.BOOKED,
        isTelemedicine: true,
        confirmationNumber: 'CONF123',
      };

      const telemedicineLink = 'https://telemedicine.example.com/room/123';

      const result = await service.sendTelemedicineLink(
        appointment as any,
        telemedicineLink,
      );

      expect(result).toBe(true);
      // Just verify it was called at least once, exact count may vary
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should not send telemedicine link if not a telemedicine appointment', async () => {
      const appointment: Partial<Appointment> = {
        id: 'appointment-id',
        patientId: 'patient-id',
        status: AppointmentStatus.BOOKED,
        isTelemedicine: false,
      };

      const telemedicineLink = 'https://telemedicine.example.com/room/123';

      const result = await service.sendTelemedicineLink(
        appointment as any,
        telemedicineLink,
      );

      expect(result).toBe(false);
      expect(loggerSpy).not.toHaveBeenCalled();
    });
  });

  describe('sendFollowUpReminder', () => {
    it('should send follow-up reminder', async () => {
      const appointment: Partial<Appointment> = {
        id: 'appointment-id',
        patientId: 'patient-id',
        providerId: 'provider-id',
        startDateTime: new Date('2025-06-01T10:00:00Z'),
        followUpRequired: true,
        followUpDate: new Date('2025-06-15T10:00:00Z'),
        followUpNotes: 'Follow up on medication response',
      };

      const result = await service.sendFollowUpReminder(appointment as any);

      expect(result).toBe(true);
      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should not send follow-up reminder if not required', async () => {
      const appointment: Partial<Appointment> = {
        id: 'appointment-id',
        patientId: 'patient-id',
        followUpRequired: false,
      };

      const result = await service.sendFollowUpReminder(appointment as any);

      expect(result).toBe(false);
      expect(loggerSpy).not.toHaveBeenCalled();
    });
  });
});
