import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AppointmentsService } from '../services/appointments.service';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { UpdateAppointmentDto } from '../dto/update-appointment.dto';
import { Appointment } from '../entities/appointment.entity';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { MedicalPriority } from '../enums/medical-priority.enum';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

@ApiTags('appointments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The appointment has been successfully created.',
    type: Appointment,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid appointment data.',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Provider is not available or time conflicts with existing appointments.',
  })
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentsService.create(createAppointmentDto);
  }

  @Get()
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get all appointments with optional filtering' })
  @ApiQuery({
    name: 'patientId',
    required: false,
    description: 'Filter by patient ID',
  })
  @ApiQuery({
    name: 'providerId',
    required: false,
    description: 'Filter by provider ID',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date (ISO format)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by end date (ISO format)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by appointment status',
    enum: AppointmentStatus,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of appointments',
    type: [Appointment],
  })
  findAll(
    @Query('patientId') patientId?: string,
    @Query('providerId') providerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('status') status?: AppointmentStatus,
  ): Promise<Appointment[]> {
    const filters: any = {};

    if (patientId) filters.patientId = patientId;
    if (providerId) filters.providerId = providerId;
    if (status) filters.status = status;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.appointmentsService.findAll(filters);
  }

  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT')
  @ApiOperation({ summary: 'Get appointment by ID' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The appointment',
    type: Appointment,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found',
  })
  findOne(@Param('id') id: string): Promise<Appointment> {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Update an appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The appointment has been successfully updated.',
    type: Appointment,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid appointment data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Provider is not available or time conflicts with existing appointments',
  })
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete an appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The appointment has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.appointmentsService.remove(id);
  }

  @Post(':id/cancel')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT')
  @ApiOperation({ summary: 'Cancel an appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The appointment has been successfully cancelled.',
    type: Appointment,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found',
  })
  cancelAppointment(
    @Param('id') id: string,
    @Body() cancelData: { reason: string; cancelledBy: string },
  ): Promise<Appointment> {
    return this.appointmentsService.cancelAppointment(
      id,
      cancelData.reason,
      cancelData.cancelledBy,
    );
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Update appointment status' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The appointment status has been successfully updated.',
    type: Appointment,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() statusData: { status: AppointmentStatus },
  ): Promise<Appointment> {
    return this.appointmentsService.updateStatus(id, statusData.status);
  }

  @Get('patient/:patientId/upcoming')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'PATIENT')
  @ApiOperation({ summary: 'Get upcoming appointments for a patient' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of upcoming appointments',
    type: [Appointment],
  })
  findUpcomingForPatient(
    @Param('patientId') patientId: string,
  ): Promise<Appointment[]> {
    return this.appointmentsService.findUpcomingForPatient(patientId);
  }

  @Get('provider/:providerId/upcoming')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get upcoming appointments for a provider' })
  @ApiParam({ name: 'providerId', description: 'Provider ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of upcoming appointments',
    type: [Appointment],
  })
  findUpcomingForProvider(
    @Param('providerId') providerId: string,
  ): Promise<Appointment[]> {
    return this.appointmentsService.findUpcomingForProvider(providerId);
  }

  @Get('priority/:priority')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')
  @ApiOperation({ summary: 'Get appointments by medical priority' })
  @ApiParam({
    name: 'priority',
    description: 'Medical priority',
    enum: MedicalPriority,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of appointments by priority',
    type: [Appointment],
  })
  findByMedicalPriority(
    @Param('priority') priority: MedicalPriority,
  ): Promise<Appointment[]> {
    return this.appointmentsService.findByMedicalPriority(priority);
  }

  @Post(':id/reminder-sent')
  @Roles('ADMIN', 'RECEPTIONIST', 'SYSTEM')
  @ApiOperation({ summary: 'Mark appointment reminder as sent' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The appointment reminder has been marked as sent.',
    type: Appointment,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found',
  })
  markReminderSent(@Param('id') id: string): Promise<Appointment> {
    return this.appointmentsService.markReminderSent(id);
  }

  @Post(':id/follow-up')
  @Roles('ADMIN', 'DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'Set follow-up information for an appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The follow-up information has been set.',
    type: Appointment,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found',
  })
  setFollowUp(
    @Param('id') id: string,
    @Body() followUpData: { followUpDate: string; followUpNotes: string },
  ): Promise<Appointment> {
    return this.appointmentsService.setFollowUp(
      id,
      new Date(followUpData.followUpDate),
      followUpData.followUpNotes,
    );
  }

  @Post(':id/consultation-outcome')
  @Roles('ADMIN', 'DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'Record consultation outcome for an appointment' })
  @ApiParam({ name: 'id', description: 'Appointment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The consultation outcome has been recorded.',
    type: Appointment,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found',
  })
  recordConsultationOutcome(
    @Param('id') id: string,
    @Body()
    outcomeData: {
      diagnosis: string;
      treatment: string;
      prescriptions: string[];
      labTests: string[];
      followUpInstructions: string;
    },
  ): Promise<Appointment> {
    return this.appointmentsService.recordConsultationOutcome(id, outcomeData);
  }
}
