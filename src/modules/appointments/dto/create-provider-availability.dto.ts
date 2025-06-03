import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsDateString,
  IsBoolean,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';

export class CreateProviderAvailabilityDto {
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
    description: 'Availability start date and time (ISO 8601 format)',
    example: '2024-06-15T09:00:00.000Z',
    type: String,
    format: 'date-time',
    required: true,
  })
  @IsDateString()
  startDateTime: string;

  @ApiProperty({
    description: 'Availability end date and time (ISO 8601 format)',
    example: '2024-06-15T17:00:00.000Z',
    type: String,
    format: 'date-time',
    required: true,
  })
  @IsDateString()
  endDateTime: string;

  @ApiPropertyOptional({
    description: 'Whether the provider is available during this time slot',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this availability recurs',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @ApiPropertyOptional({
    description: 'Recurrence pattern (DAILY, WEEKLY, MONTHLY)',
    example: 'WEEKLY',
  })
  @IsOptional()
  @IsString()
  recurrencePattern?: string;

  @ApiPropertyOptional({
    description: 'End date for recurring availability (ISO 8601 format)',
    example: '2024-12-31T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  recurrenceEndDate?: string;

  @ApiPropertyOptional({
    description: 'Whether telemedicine is available during this time slot',
    example: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isTelemedicineAvailable?: boolean;

  @ApiPropertyOptional({
    description:
      'Whether in-person appointments are available during this time slot',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isInPersonAvailable?: boolean;

  @ApiPropertyOptional({
    description: 'Specialties available during this time slot',
    example: ['Cardiology', 'General Medicine'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialtiesAvailable?: string[];

  @ApiPropertyOptional({
    description: 'Location for in-person appointments',
    example: 'Main Hospital Campus',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Additional notes about availability',
    example: 'Available for emergency consultations only',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
