import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, IsBoolean, IsArray, IsUUID, IsDateString } from 'class-validator';
import { MedicationRoute } from '../enums/medication-route.enum';

export class CreatePrescriptionDto {
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @IsNotEmpty()
  @IsUUID()
  prescribingProviderId: string;

  @IsOptional()
  @IsUUID()
  medicationId?: string;

  @IsNotEmpty()
  @IsString()
  medicationName: string;

  @IsNotEmpty()
  @IsString()
  strength: string;

  @IsNotEmpty()
  @IsString()
  dosageForm: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsNotEmpty()
  @IsString()
  quantityUnit: string;

  @IsNotEmpty()
  @IsEnum(MedicationRoute)
  route: MedicationRoute;

  @IsNotEmpty()
  @IsString()
  frequency: string;

  @IsOptional()
  @IsString()
  timingInstructions?: string;

  @IsOptional()
  @IsNumber()
  durationDays?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  prnReason?: string;

  @IsOptional()
  @IsString()
  maxDosePerPeriod?: string;

  @IsOptional()
  @IsNumber()
  refillsAllowed?: number;

  @IsOptional()
  @IsBoolean()
  dispenseAsWritten?: boolean;

  @IsOptional()
  @IsUUID()
  pharmacyId?: string;

  @IsOptional()
  @IsString()
  pharmacyNotes?: string;

  @IsOptional()
  @IsArray()
  allergiesNoted?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsNotEmpty()
  @IsUUID()
  createdBy: string;
}
