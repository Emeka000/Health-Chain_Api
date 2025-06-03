import {
  IsString,
  IsDate,
  IsEnum,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsUUID,
  IsArray,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScheduleType } from '../enums/schedule-type.enum';

class RecurrencePatternDto {
  @IsEnum(['DAILY', 'WEEKLY', 'MONTHLY'])
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';

  @IsNumber()
  @Min(1)
  interval: number;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek?: number[];
}

export class CreateScheduleDto {
  @IsUUID()
  doctorId: string;

  @IsEnum(ScheduleType)
  scheduleType: ScheduleType;

  @IsDate()
  @Type(() => Date)
  startTime: Date;

  @IsDate()
  @Type(() => Date)
  endTime: Date;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsString()
  appointmentType?: string;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => RecurrencePatternDto)
  recurrencePattern?: RecurrencePatternDto;

  @IsOptional()
  @IsString()
  notes?: string;
}
