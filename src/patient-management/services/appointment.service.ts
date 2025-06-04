import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from 'src/entities/appointment.entity';
import { Repository, Between } from 'typeorm';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async create(patientId: string, createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    // Check for conflicting appointments
    const appointmentTime = new Date(createAppointmentDto.appointmentDateTime);
    const endTime = new Date(appointmentTime.getTime() + (createAppointmentDto.duration || 60) * 60000);

    const conflictingAppointment = await this.appointmentRepository.findOne({
      where: {
        appointmentDateTime: Between(appointmentTime, endTime),
        status: 'scheduled'
      }
    });

    if (conflictingAppointment) {
      throw new ConflictException('Time slot already booked');
    }

    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      patientId,
      status: 'scheduled'
    });

    return await this.appointmentRepository.save(appointment);
  }

  async findByPatient(patientId: string): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      where: { patientId },
      order: { appointmentDateTime: 'ASC' }
    });
  }

  async findUpcoming(days: number = 7): Promise<Appointment[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    return await this.appointmentRepository.find({
      where: {
        appointmentDateTime: Between(now, futureDate),
        status: 'scheduled'
      },
      relations: ['patient'],
      order: { appointmentDateTime: 'ASC' }
    });
  }

  async updateStatus(id: string, status: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    appointment.status = status;
    return await this.appointmentRepository.save(appointment);
  }

  async reschedule(id: string, newDateTime: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({ where: { id } });
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    appointment.appointmentDateTime = new Date(newDateTime);
    return await this.appointmentRepository.save(appointment);
  }
}