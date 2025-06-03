import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { NotificationService } from '../services/notification.service';
import { AppointmentsService } from '../services/appointments.service';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly appointmentsService: AppointmentsService,
  ) {}

  @Post('appointment/:id/reminder')
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Send appointment reminder' })
  @ApiResponse({ status: 200, description: 'Reminder sent successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async sendAppointmentReminder(@Param('id') id: string) {
    const appointment = await this.appointmentsService.findOne(id);
    const result =
      await this.notificationService.sendAppointmentReminder(appointment);
    return {
      success: result,
      message: result
        ? 'Reminder sent successfully'
        : 'Failed to send reminder',
    };
  }

  @Post('appointment/:id/confirmation')
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Send appointment confirmation' })
  @ApiResponse({ status: 200, description: 'Confirmation sent successfully' })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async sendAppointmentConfirmation(@Param('id') id: string) {
    const appointment = await this.appointmentsService.findOne(id);
    const result =
      await this.notificationService.sendAppointmentConfirmation(appointment);
    return {
      success: result,
      message: result
        ? 'Confirmation sent successfully'
        : 'Failed to send confirmation',
    };
  }

  @Post('appointment/:id/cancellation')
  @Roles('admin', 'staff')
  @ApiOperation({ summary: 'Send appointment cancellation notification' })
  @ApiResponse({
    status: 200,
    description: 'Cancellation notification sent successfully',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async sendAppointmentCancellation(@Param('id') id: string) {
    const appointment = await this.appointmentsService.findOne(id);
    const result =
      await this.notificationService.sendAppointmentCancellation(appointment);
    return {
      success: result,
      message: result
        ? 'Cancellation notification sent successfully'
        : 'Failed to send cancellation notification',
    };
  }

  @Post('appointment/:id/telemedicine-link')
  @Roles('admin', 'staff', 'doctor')
  @ApiOperation({ summary: 'Send telemedicine link notification' })
  @ApiResponse({
    status: 200,
    description: 'Telemedicine link sent successfully',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async sendTelemedicineLink(
    @Param('id') id: string,
    @Body() body: { telemedicineLink: string },
  ) {
    const appointment = await this.appointmentsService.findOne(id);
    const result = await this.notificationService.sendTelemedicineLink(
      appointment,
      body.telemedicineLink,
    );
    return {
      success: result,
      message: result
        ? 'Telemedicine link sent successfully'
        : 'Failed to send telemedicine link',
    };
  }

  @Post('appointment/:id/follow-up-reminder')
  @Roles('admin', 'staff', 'doctor')
  @ApiOperation({ summary: 'Send follow-up reminder notification' })
  @ApiResponse({
    status: 200,
    description: 'Follow-up reminder sent successfully',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async sendFollowUpReminder(@Param('id') id: string) {
    const appointment = await this.appointmentsService.findOne(id);
    const result =
      await this.notificationService.sendFollowUpReminder(appointment);
    return {
      success: result,
      message: result
        ? 'Follow-up reminder sent successfully'
        : 'Failed to send follow-up reminder',
    };
  }

  @Get('appointment/:id/status')
  @Roles('admin', 'staff', 'doctor', 'patient')
  @ApiOperation({ summary: 'Get notification status for an appointment' })
  @ApiResponse({
    status: 200,
    description: 'Notification status retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Appointment not found' })
  async getNotificationStatus(@Param('id') id: string) {
    const appointment = await this.appointmentsService.findOne(id);
    return {
      appointmentId: appointment.id,
      reminderSent: appointment.reminderSent,
      reminderSentAt: appointment.reminderSentAt,
      followUpRequired: appointment.followUpRequired,
      followUpDate: appointment.followUpDate,
    };
  }
}
