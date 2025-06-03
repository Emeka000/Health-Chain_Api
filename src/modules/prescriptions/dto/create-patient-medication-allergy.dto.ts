import { IsNotEmpty, IsString, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { AllergySeverity, AllergyStatus } from '../entities/patient-medication-allergy.entity';

export class CreatePatientMedicationAllergyDto {
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @IsNotEmpty()
  @IsString()
  substance: string;

  @IsOptional()
  @IsString()
  substanceClass?: string;

  @IsOptional()
  @IsEnum(AllergySeverity)
  severity?: AllergySeverity;

  @IsOptional()
  @IsEnum(AllergyStatus)
  status?: AllergyStatus;

  @IsOptional()
  @IsString()
  reaction?: string;

  @IsOptional()
  @IsDateString()
  onsetDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsNotEmpty()
  @IsUUID()
  recordedBy: string;
}
