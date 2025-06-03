import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsultationNote } from '../entities/consultation-note.entity';
import { CreateConsultationNoteDto } from '../dto/create-consultation-note.dto';
import { UpdateConsultationNoteDto } from '../dto/update-consultation-note.dto';
import { AppointmentsService } from './appointments.service';
import { AppointmentStatus } from '../enums/appointment-status.enum';

@Injectable()
export class ConsultationNotesService {
  constructor(
    @InjectRepository(ConsultationNote)
    private readonly consultationNoteRepository: Repository<ConsultationNote>,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  /**
   * Create a new consultation note
   */
  async create(
    createConsultationNoteDto: CreateConsultationNoteDto,
  ): Promise<ConsultationNote> {
    // Get the appointment to verify it exists and update its status
    const appointment = await this.appointmentsService.findOne(
      createConsultationNoteDto.appointmentId,
    );

    // Update appointment status to FULFILLED
    await this.appointmentsService.updateStatus(
      appointment.id,
      AppointmentStatus.FULFILLED,
    );

    // Handle follow-up if specified
    if (createConsultationNoteDto.followUpDate) {
      await this.appointmentsService.setFollowUp(
        appointment.id,
        new Date(createConsultationNoteDto.followUpDate),
        createConsultationNoteDto.followUpInstructions ||
          'Follow-up appointment required',
      );
    }

    // Create consultation note
    const consultationNote = this.consultationNoteRepository.create({
      ...createConsultationNoteDto,
      followUpDate: createConsultationNoteDto.followUpDate
        ? new Date(createConsultationNoteDto.followUpDate)
        : undefined,
    });

    return this.consultationNoteRepository.save(consultationNote);
  }

  /**
   * Find all consultation notes with optional filtering
   */
  async findAll(filters?: {
    appointmentId?: string;
    providerId?: string;
    patientId?: string;
  }): Promise<ConsultationNote[]> {
    const query: any = {};

    if (filters) {
      if (filters.appointmentId) query.appointmentId = filters.appointmentId;
      if (filters.providerId) query.providerId = filters.providerId;

      // For patient ID, we need to join with appointments
      if (filters.patientId) {
        return this.consultationNoteRepository
          .createQueryBuilder('note')
          .innerJoin(
            'appointments',
            'appointment',
            'note.appointmentId = appointment.id',
          )
          .where('appointment.patientId = :patientId', {
            patientId: filters.patientId,
          })
          .getMany();
      }
    }

    return this.consultationNoteRepository.find({
      where: query,
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find one consultation note by ID
   */
  async findOne(id: string): Promise<ConsultationNote> {
    const consultationNote = await this.consultationNoteRepository.findOne({
      where: { id },
    });

    if (!consultationNote) {
      throw new NotFoundException(`Consultation note with ID ${id} not found`);
    }

    return consultationNote;
  }

  /**
   * Find consultation notes by appointment ID
   */
  async findByAppointment(appointmentId: string): Promise<ConsultationNote[]> {
    return this.consultationNoteRepository.find({
      where: { appointmentId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update a consultation note
   */
  async update(
    id: string,
    updateConsultationNoteDto: UpdateConsultationNoteDto,
  ): Promise<ConsultationNote> {
    const consultationNote = await this.findOne(id);

    // Handle follow-up date if provided
    if (updateConsultationNoteDto.followUpDate) {
      const followUpDate = new Date(updateConsultationNoteDto.followUpDate);

      // Update appointment follow-up info if needed
      if (
        !consultationNote.followUpDate ||
        consultationNote.followUpDate.getTime() !== followUpDate.getTime()
      ) {
        await this.appointmentsService.setFollowUp(
          consultationNote.appointmentId,
          followUpDate,
          updateConsultationNoteDto.followUpInstructions ||
            consultationNote.followUpInstructions ||
            '',
        );
      }

      // Update the DTO with the Date object
      updateConsultationNoteDto.followUpDate = followUpDate as any;
    }

    // Update the consultation note
    Object.assign(consultationNote, updateConsultationNoteDto);

    return this.consultationNoteRepository.save(consultationNote);
  }

  /**
   * Remove a consultation note
   */
  async remove(id: string): Promise<void> {
    const consultationNote = await this.findOne(id);
    await this.consultationNoteRepository.remove(consultationNote);
  }

  /**
   * Schedule a follow-up appointment
   */
  async scheduleFollowUp(
    id: string,
    followUpAppointmentId: string,
  ): Promise<ConsultationNote> {
    const consultationNote = await this.findOne(id);

    consultationNote.followUpScheduled = true;
    consultationNote.followUpAppointmentId = followUpAppointmentId;

    return this.consultationNoteRepository.save(consultationNote);
  }
}
