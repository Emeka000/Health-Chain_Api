import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsDateString,
  IsEnum,
  IsString,
  IsOptional,
  Length,
  IsBoolean,
  ValidateIf,
} from 'class-validator';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { AppointmentType } from '../enums/appointment-type.enum';
import { MedicalPriority } from '../enums/medical-priority.enum';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Patient UUID reference',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    format: 'uuid',
    required: true,
  })
  @IsUUID()
  patientId: string;

  @ApiProperty({
    description: 'Healthcare provider UUID reference',
    example: '550e8400-e29b-41d4-a716-446655440001',
    type: String,
    format: 'uuid',
    required: true,
  })
  @IsUUID()
  providerId: string;

  @ApiProperty({
    description: 'Appointment start date and time (ISO 8601 format)',
    example: '2024-06-15T14:30:00.000Z',
    type: String,
    format: 'date-time',
    required: true,
  })
  @IsDateString()
  startDateTime: string;

  @ApiProperty({
    description: 'Appointment end date and time (ISO 8601 format)',
    example: '2024-06-15T15:30:00.000Z',
    type: String,
    format: 'date-time',
    required: true,
  })
  @IsDateString()
  endDateTime: string;

  @ApiPropertyOptional({
    description: 'Appointment status',
    enum: AppointmentStatus,
    example: AppointmentStatus.BOOKED,
    default: AppointmentStatus.PROPOSED,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({
    description: 'Type of appointment',
    enum: AppointmentType,
    example: AppointmentType.ROUTINE,
    required: true,
  })
  @IsEnum(AppointmentType)
  appointmentType: AppointmentType;

  @ApiPropertyOptional({
    description: 'Medical priority of the appointment',
    enum: MedicalPriority,
    example: MedicalPriority.MEDIUM,
    default: MedicalPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(MedicalPriority)
  medicalPriority?: MedicalPriority;

  @ApiPropertyOptional({
    description: 'Reason for appointment (Medical terminology preferred)',
    example: 'Annual Physical Examination',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @Length(0, 200)
  reasonForVisit?: string;

  @ApiPropertyOptional({
    description: 'Chief complaint as described by the patient',
    example: 'Persistent cough for 2 weeks',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  chiefComplaint?: string;

  @ApiPropertyOptional({
    description: 'Additional notes for the appointment',
    example: 'Patient has history of asthma',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a telemedicine appointment',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isTelemedicine?: boolean;

  @ApiPropertyOptional({
    description: 'Telemedicine URL for virtual appointments',
    example: 'https://telehealth.hospital.org/room/12345',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.isTelemedicine === true)
  telemedicineUrl?: string;

  @ApiPropertyOptional({
    description: 'Location for in-person appointments',
    example: 'Main Hospital Campus',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.isTelemedicine !== true)
  location?: string;

  @ApiPropertyOptional({
    description: 'Room number for in-person appointments',
    example: 'B-204',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.isTelemedicine !== true)
  roomNumber?: string;
}
