import { Controller, Get, Post, Put, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AppointmentService } from './appointment.service';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
  constructor(private appointmentService: AppointmentService) {}

  @Get()
  async getAppointments(@Request() req) {
    return this.appointmentService.getPatientAppointments(req.user.sub);
  }

  @Get('upcoming')
  async getUpcomingAppointments(@Request() req) {
    return this.appointmentService.getUpcomingAppointments(req.user.sub);
  }

  @Post()
  async scheduleAppointment(@Request() req, @Body() appointmentData: any) {
    return this.appointmentService.scheduleAppointment(req.user.sub, appointmentData);
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: number, @Body() { status }: { status: string }) {
    return this.appointmentService.updateAppointmentStatus(id, status);
  }
}
