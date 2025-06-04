import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Appointment, AppointmentStatus } from './entities/appointment.entity';
import { User } from '../users/entities/user.entity';
import { VideoService } from '../video/video.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private videoService: VideoService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const { patientId, doctorId, scheduledTime, ...appointmentData } = createAppointmentDto;

    const patient = await this.userRepository.findOne({ where: { id: patientId } });
    const doctor = await this.userRepository.findOne({ where: { id: doctorId } });

    if (!patient || !doctor) {
      throw new NotFoundException('Patient or doctor not found');
    }

    // Check for scheduling conflicts
    const conflictingAppointment = await this.appointmentRepository.findOne({
      where: {
        doctor: { id: doctorId },
        scheduledTime: Between(
          new Date(scheduledTime.getTime() - 30 * 60000),
          new Date(scheduledTime.getTime() + 30 * 60000)
        ),
        status: AppointmentStatus.SCHEDULED,
      },
    });

    if (conflictingAppointment) {
      throw new BadRequestException('Doctor is not available at this time');
    }

    const appointment = this.appointmentRepository.create({
      ...appointmentData,
      patient,
      doctor,
      scheduledTime: new Date(scheduledTime),
    });

    const savedAppointment = await this.appointmentRepository.save(appointment);

    // Create video session for the appointment
    await this.videoService.createSession(savedAppointment.id);

    return savedAppointment;
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      relations: ['patient', 'doctor', 'videoSession'],
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['patient', 'doctor', 'videoSession', 'documentation'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return appointment;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    Object.assign(appointment, updateAppointmentDto);
    return this.appointmentRepository.save(appointment);
  }

  async cancel(id: string): Promise<Appointment> {
    const appointment = await this.findOne(id);
    appointment.status = AppointmentStatus.CANCELLED;
    return this.appointmentRepository.save(appointment);
  }

  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { patient: { id: patientId } },
      relations: ['doctor', 'videoSession'],
      order: { scheduledTime: 'ASC' },
    });
  }

  async getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { doctor: { id: doctorId } },
      relations: ['patient', 'videoSession'],
      order: { scheduledTime: 'ASC' },
    });
  }
}
