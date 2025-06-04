import { IsString, IsDateString, IsOptional, IsNumber, IsIn } from 'class-validator';

export class CreateAppointmentDto {
  @IsDateString()
  appointmentDateTime: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsIn(['consultation', 'follow-up', 'procedure'])
  type: string;

  @IsOptional()
  @IsString()
  providerId?: string;

  @IsOptional()
  @IsString()
  providerName?: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
