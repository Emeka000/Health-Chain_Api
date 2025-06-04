import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { AppointmentService } from 'src/appointment/appointment.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';

@Controller('api/patients/:patientId/appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  async create(@Param('patientId') patientId: number, @Body() createAppointmentDto: CreateAppointmentDto) {
    return await this.appointmentService.scheduleAppointment(
      patientId,
      createAppointmentDto,
    );
  }

  @Get()
  async findByPatient(@Param('patientId') patientId: number) {
    return await this.appointmentService.getPatientAppointments(patientId);
  }

  @Get('upcoming')
  async findUpcoming(@Query('days') days: number = 7) {
    return await this.appointmentService.getUpcomingAppointments(days);
  }

  @Patch(':id/status')
  async updateStatus(@Param('id') id: number, @Body('status') status: string) {
    return await this.appointmentService.updateAppointmentStatus(id, status);
  }

  @Patch(':id/reschedule')
  async reschedule(@Param('id') id: number, @Body('appointmentDateTime') newDateTime: Date) {
    return await this.appointmentService.resheduleAppointment(id, newDateTime);
  }
}