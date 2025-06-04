import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async getPatientAppointments(patientId: number) {
    return this.appointmentRepository.find({
      where: { patient: { id: patientId } },
      order: { appointmentDate: 'ASC' },
    });
  }

  async scheduleAppointment(patientId: number, appointmentData: any) {
    const appointment = this.appointmentRepository.create({
      ...appointmentData,
      patient: { id: patientId },
      status: 'scheduled',
    });
    return this.appointmentRepository.save(appointment);
  }

  async updateAppointmentStatus(appointmentId: number, status: string) {
    await this.appointmentRepository.update(appointmentId, { status });
    return this.appointmentRepository.findOne({ where: { id: appointmentId } });
  }

  async getUpcomingAppointments(patientId: number) {
    const now = new Date();
    return this.appointmentRepository.find({
      where: {
        patient: { id: patientId },
        appointmentDate: { $gte: now } as any,
        status: 'scheduled',
      },
      order: { appointmentDate: 'ASC' },
    });
  }

  async resheduleAppointment(appointmentId: number, newDate: Date) {
    await this.appointmentRepository.update(appointmentId, { appointmentDate: newDate });
    return this.appointmentRepository.findOne({ where: { id: appointmentId } });
  }
}