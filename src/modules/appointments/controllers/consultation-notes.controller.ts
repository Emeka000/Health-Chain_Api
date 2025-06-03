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
import { ConsultationNotesService } from '../services/consultation-notes.service';
import { CreateConsultationNoteDto } from '../dto/create-consultation-note.dto';
import { UpdateConsultationNoteDto } from '../dto/update-consultation-note.dto';
import { ConsultationNote } from '../entities/consultation-note.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';

@ApiTags('consultation-notes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('consultation-notes')
export class ConsultationNotesController {
  constructor(
    private readonly consultationNotesService: ConsultationNotesService,
  ) {}

  @Post()
  @Roles('ADMIN', 'DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'Create a new consultation note' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The consultation note has been successfully created.',
    type: ConsultationNote,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid consultation note data.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Referenced appointment not found.',
  })
  create(
    @Body() createConsultationNoteDto: CreateConsultationNoteDto,
  ): Promise<ConsultationNote> {
    return this.consultationNotesService.create(createConsultationNoteDto);
  }

  @Get()
  @Roles('ADMIN', 'DOCTOR', 'NURSE')
  @ApiOperation({
    summary: 'Get all consultation notes with optional filtering',
  })
  @ApiQuery({
    name: 'appointmentId',
    required: false,
    description: 'Filter by appointment ID',
  })
  @ApiQuery({
    name: 'providerId',
    required: false,
    description: 'Filter by provider ID',
  })
  @ApiQuery({
    name: 'patientId',
    required: false,
    description: 'Filter by patient ID',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of consultation notes',
    type: [ConsultationNote],
  })
  findAll(
    @Query('appointmentId') appointmentId?: string,
    @Query('providerId') providerId?: string,
    @Query('patientId') patientId?: string,
  ): Promise<ConsultationNote[]> {
    const filters: any = {};

    if (appointmentId) filters.appointmentId = appointmentId;
    if (providerId) filters.providerId = providerId;
    if (patientId) filters.patientId = patientId;

    return this.consultationNotesService.findAll(filters);
  }

  @Get(':id')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT')
  @ApiOperation({ summary: 'Get consultation note by ID' })
  @ApiParam({ name: 'id', description: 'Consultation note ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The consultation note',
    type: ConsultationNote,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Consultation note not found',
  })
  findOne(@Param('id') id: string): Promise<ConsultationNote> {
    return this.consultationNotesService.findOne(id);
  }

  @Get('appointment/:appointmentId')
  @Roles('ADMIN', 'DOCTOR', 'NURSE', 'PATIENT')
  @ApiOperation({ summary: 'Get consultation notes by appointment ID' })
  @ApiParam({ name: 'appointmentId', description: 'Appointment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of consultation notes for the appointment',
    type: [ConsultationNote],
  })
  findByAppointment(
    @Param('appointmentId') appointmentId: string,
  ): Promise<ConsultationNote[]> {
    return this.consultationNotesService.findByAppointment(appointmentId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DOCTOR', 'NURSE')
  @ApiOperation({ summary: 'Update a consultation note' })
  @ApiParam({ name: 'id', description: 'Consultation note ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The consultation note has been successfully updated.',
    type: ConsultationNote,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Consultation note not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid consultation note data',
  })
  update(
    @Param('id') id: string,
    @Body() updateConsultationNoteDto: UpdateConsultationNoteDto,
  ): Promise<ConsultationNote> {
    return this.consultationNotesService.update(id, updateConsultationNoteDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Delete a consultation note' })
  @ApiParam({ name: 'id', description: 'Consultation note ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The consultation note has been successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Consultation note not found',
  })
  remove(@Param('id') id: string): Promise<void> {
    return this.consultationNotesService.remove(id);
  }

  @Post(':id/schedule-follow-up')
  @Roles('ADMIN', 'DOCTOR', 'NURSE')
  @ApiOperation({
    summary: 'Schedule a follow-up appointment for a consultation',
  })
  @ApiParam({ name: 'id', description: 'Consultation note ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The follow-up appointment has been scheduled.',
    type: ConsultationNote,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Consultation note not found',
  })
  scheduleFollowUp(
    @Param('id') id: string,
    @Body() followUpData: { followUpAppointmentId: string },
  ): Promise<ConsultationNote> {
    return this.consultationNotesService.scheduleFollowUp(
      id,
      followUpData.followUpAppointmentId,
    );
  }
}
