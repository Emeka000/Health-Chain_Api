import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsUUID, IsDateString } from 'class-validator';

export class CreateMedicationAdministrationDto {
  @IsNotEmpty()
  @IsUUID()
  prescriptionId: string;

  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @IsNotEmpty()
  @IsDateString()
  administeredAt: string;

  @IsNotEmpty()
  @IsString()
  administeredDose: string;

  @IsNotEmpty()
  @IsUUID()
  administeredBy: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsBoolean()
  wasRefused?: boolean;

  @IsOptional()
  @IsString()
  refusalReason?: string;

  @IsOptional()
  @IsBoolean()
  wasOmitted?: boolean;

  @IsOptional()
  @IsString()
  omissionReason?: string;

  @IsOptional()
  @IsString()
  patientResponse?: string;

  @IsOptional()
  @IsString()
  adverseReaction?: string;
}
