import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsObject,
  IsBoolean,
  IsDateString,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RecordType } from '../../entities/medical-record.entity';

export class VitalSignsDto {
  @IsOptional()
  temperature?: number;

  @IsOptional()
  @IsObject()
  bloodPressure?: { systolic: number; diastolic: number };

  @IsOptional()
  heartRate?: number;

  @IsOptional()
  respiratoryRate?: number;

  @IsOptional()
  oxygenSaturation?: number;

  @IsOptional()
  weight?: number;

  @IsOptional()
  height?: number;

  @IsOptional()
  bmi?: number;
}

export class CreateMedicalRecordDto {
  @IsEnum(RecordType)
  recordType: RecordType;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  structuredData?: Record<string, any>;

  @IsOptional()
  @ValidateNested()
  @Type(() => VitalSignsDto)
  vitalSigns?: VitalSignsDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  symptoms?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  diagnoses?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  treatments?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  medications?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergies?: string[];

  @IsOptional()
  @IsString()
  clinicalImpression?: string;

  @IsOptional()
  @IsString()
  treatmentPlan?: string;

  @IsOptional()
  @IsString()
  followUpInstructions?: string;

  @IsOptional()
  @IsDateString()
  encounterDate?: string;

  @IsOptional()
  @IsString()
  encounterType?: string;

  @IsOptional()
  @IsBoolean()
  isConfidential?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  accessRestictions?: string[];

  @IsUUID()
  patientId: string;

  @IsUUID()
  doctorId: string;

  @IsOptional()
  @IsUUID()
  parentRecordId?: string;
}
