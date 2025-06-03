import { IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateConsentDto {
  @IsNumber()
  patientId: number;

  @IsString()
  consentType: string;

  @IsOptional()
  @IsString()
  details?: string;
}