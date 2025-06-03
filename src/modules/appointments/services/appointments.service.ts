import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
} from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { ProviderAvailability } from '../entities/provider-availability.entity';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { MedicalPriority } from '../enums/medical-priority.enum';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(ProviderAvailability)
    private readonly providerAvailabilityRepository: Repository<ProviderAvailability>,
  ) {}

  /**
   * Create a new appointment with validation for provider availability and conflicts
   */
  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    // Convert string dates to Date objects
    const startDateTime = new Date(createAppointmentDto.startDateTime);
    const endDateTime = new Date(createAppointmentDto.endDateTime);

    // Validate appointment times
    this.validateAppointmentTimes(startDateTime, endDateTime);

    // Check if the provider is available during the requested time
    await this.checkProviderAvailability(
      createAppointmentDto.providerId,
      startDateTime,
      endDateTime,
      createAppointmentDto.isTelemedicine,
    );

    // Check for conflicting appointments for the provider
    await this.checkProviderScheduleConflicts(
      createAppointmentDto.providerId,
      startDateTime,
      endDateTime,
    );

    // Generate a confirmation number
    const confirmationNumber = `APPT-${new Date().getFullYear()}-${uuidv4().substring(0, 6).toUpperCase()}`;

    // Create the appointment entity
    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      startDateTime,
      endDateTime,
      status: createAppointmentDto.status || AppointmentStatus.BOOKED,
      medicalPriority:
        createAppointmentDto.medicalPriority || MedicalPriority.MEDIUM,
      confirmationNumber,
    });

    return this.appointmentRepository.save(appointment);
  }

  /**
   * Find all appointments with optional filtering
   */
  async findAll(filters?: {
    patientId?: string;
    providerId?: string;
    startDate?: Date;
    endDate?: Date;
    status?: AppointmentStatus;
  }): Promise<Appointment[]> {
    const query: any = {};

    if (filters) {
      if (filters.patientId) query.patientId = filters.patientId;
      if (filters.providerId) query.providerId = filters.providerId;
      if (filters.status) query.status = filters.status;

      if (filters.startDate && filters.endDate) {
        query.startDateTime = Between(filters.startDate, filters.endDate);
      } else if (filters.startDate) {
        query.startDateTime = MoreThanOrEqual(filters.startDate);
      } else if (filters.endDate) {
        query.startDateTime = LessThanOrEqual(filters.endDate);
      }
    }

    return this.appointmentRepository.find({
      where: query,
      order: { startDateTime: 'ASC' },
    });
  }

  /**
   * Find one appointment by ID
   */
  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  /**
   * Update an appointment
   */
  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // If updating dates, validate them
    if (
      updateAppointmentDto.startDateTime ||
      updateAppointmentDto.endDateTime
    ) {
      const startDateTime = updateAppointmentDto.startDateTime
        ? new Date(updateAppointmentDto.startDateTime)
        : appointment.startDateTime;

      const endDateTime = updateAppointmentDto.endDateTime
        ? new Date(updateAppointmentDto.endDateTime)
        : appointment.endDateTime;

      this.validateAppointmentTimes(startDateTime, endDateTime);

      // Check availability and conflicts only if dates are changing
      if (
        updateAppointmentDto.startDateTime ||
        updateAppointmentDto.endDateTime ||
        updateAppointmentDto.providerId
      ) {
        const providerId =
          updateAppointmentDto.providerId || appointment.providerId;

        await this.checkProviderAvailability(
          providerId,
          startDateTime,
          endDateTime,
          updateAppointmentDto.isTelemedicine !== undefined
            ? updateAppointmentDto.isTelemedicine
            : appointment.isTelemedicine,
        );

        await this.checkProviderScheduleConflicts(
          providerId,
          startDateTime,
          endDateTime,
          id, // Exclude current appointment from conflict check
        );
      }

      // Update the dates
      if (updateAppointmentDto.startDateTime) {
        appointment.startDateTime = startDateTime;
      }

      if (updateAppointmentDto.endDateTime) {
        appointment.endDateTime = endDateTime;
      }
    }

    // Update other fields
    Object.assign(appointment, updateAppointmentDto);

    return this.appointmentRepository.save(appointment);
  }

  /**
   * Remove an appointment
   */
  async remove(id: string): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentRepository.remove(appointment);
  }

  /**
   * Cancel an appointment
   */
  async cancelAppointment(
    id: string,
    reason: string,
    cancelledBy: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    appointment.status = AppointmentStatus.CANCELLED;
    appointment.cancellationReason = reason;
    appointment.cancellationDate = new Date();
    appointment.cancelledBy = cancelledBy;

    return this.appointmentRepository.save(appointment);
  }

  /**
   * Update appointment status
   */
  async updateStatus(
    id: string,
    status: AppointmentStatus,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.status = status;

    return this.appointmentRepository.save(appointment);
  }

  /**
   * Find upcoming appointments for a patient
   */
  async findUpcomingForPatient(patientId: string): Promise<Appointment[]> {
    const now = new Date();

    return this.appointmentRepository.find({
      where: {
        patientId,
        startDateTime: MoreThanOrEqual(now),
        status: AppointmentStatus.BOOKED,
      },
      order: { startDateTime: 'ASC' },
    });
  }

  /**
   * Find upcoming appointments for a provider
   */
  async findUpcomingForProvider(providerId: string): Promise<Appointment[]> {
    const now = new Date();

    return this.appointmentRepository.find({
      where: {
        providerId,
        startDateTime: MoreThanOrEqual(now),
        status: AppointmentStatus.BOOKED,
      },
      order: { startDateTime: 'ASC' },
    });
  }

  /**
   * Find appointments by medical priority
   */
  async findByMedicalPriority(
    priority: MedicalPriority,
  ): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { medicalPriority: priority },
      order: { startDateTime: 'ASC' },
    });
  }

  /**
   * Mark appointment reminder as sent
   */
  async markReminderSent(id: string): Promise<Appointment> {
    const appointment = await this.findOne(id);

    appointment.reminderSent = true;
    appointment.reminderSentAt = new Date();

    return this.appointmentRepository.save(appointment);
  }

  /**
   * Set follow-up information
   */
  async setFollowUp(
    id: string,
    followUpDate: Date,
    followUpNotes: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    appointment.followUpRequired = true;
    appointment.followUpDate = followUpDate;
    appointment.followUpNotes = followUpNotes;

    return this.appointmentRepository.save(appointment);
  }

  /**
   * Record consultation outcome
   */
  async recordConsultationOutcome(
    id: string,
    outcome: {
      diagnosis: string;
      treatment: string;
      prescriptions: string[];
      labTests: string[];
      followUpInstructions: string;
    },
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    appointment.consultationOutcome = outcome;
    appointment.status = AppointmentStatus.FULFILLED;

    return this.appointmentRepository.save(appointment);
  }

  /**
   * Validate appointment times
   */
  private validateAppointmentTimes(
    startDateTime: Date,
    endDateTime: Date,
  ): void {
    const now = new Date();

    // Ensure start time is in the future
    if (startDateTime < now) {
      throw new BadRequestException(
        'Appointment start time must be in the future',
      );
    }

    // Ensure end time is after start time
    if (endDateTime <= startDateTime) {
      throw new BadRequestException(
        'Appointment end time must be after start time',
      );
    }

    // Ensure minimum appointment duration (e.g., 15 minutes)
    const minDurationMs = 15 * 60 * 1000; // 15 minutes in milliseconds
    if (endDateTime.getTime() - startDateTime.getTime() < minDurationMs) {
      throw new BadRequestException(
        'Appointment must be at least 15 minutes long',
      );
    }
  }

  /**
   * Check if the provider is available during the requested time
   */
  private async checkProviderAvailability(
    providerId: string,
    startDateTime: Date,
    endDateTime: Date,
    isTelemedicine: boolean = false,
  ): Promise<void> {
    // Find provider availability that overlaps with the requested time
    const availabilities = await this.providerAvailabilityRepository.find({
      where: {
        providerId,
        isAvailable: true,
        isActive: true,
      },
    });

    // Check if any availability slot covers the requested time
    const isAvailable = availabilities.some((availability) => {
      // Check if the time range overlaps
      const timeOverlap = availability.overlapsWithTimeRange(
        startDateTime,
        endDateTime,
      );

      // Check if the appointment type (telemedicine/in-person) is available
      const typeAvailable = isTelemedicine
        ? availability.isTelemedicineAvailable
        : availability.isInPersonAvailable;

      return timeOverlap && typeAvailable;
    });

    if (!isAvailable) {
      throw new ConflictException(
        'Provider is not available during the requested time',
      );
    }
  }

  /**
   * Check for conflicting appointments in the provider's schedule
   */
  private async checkProviderScheduleConflicts(
    providerId: string,
    startDateTime: Date,
    endDateTime: Date,
    excludeAppointmentId?: string,
  ): Promise<void> {
    // Find appointments that overlap with the requested time
    const query: any = {
      providerId,
      status: AppointmentStatus.BOOKED,
      startDateTime: LessThanOrEqual(endDateTime),
      endDateTime: MoreThanOrEqual(startDateTime),
    };

    // Exclude the current appointment if updating
    if (excludeAppointmentId) {
      query.id = Not(excludeAppointmentId);
    }

    const conflictingAppointments = await this.appointmentRepository.find({
      where: query,
    });

    if (conflictingAppointments.length > 0) {
      throw new ConflictException(
        'The requested time conflicts with existing appointments',
      );
    }
  }
}
