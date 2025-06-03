import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  Matches,
  IsEnum,
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum EmergencyLevel {
  CRITICAL = 'CRITICAL',
  URGENT = 'URGENT',
  STANDARD = 'STANDARD',
}

export class MedicalCodeDto {
  @ApiProperty({ description: 'ICD-10 diagnosis code' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z]\d{2}(\.\d{1,3})?$/, {
    message: 'Invalid ICD-10 code format',
  })
  icd10Code: string;

  @ApiProperty({ description: 'CPT procedure code' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{5}$/, { message: 'Invalid CPT code format' })
  cptCode: string;

  @ApiProperty({ description: 'Code description' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toString().trim())
  description: string;
}

export class CreateMedicalDataDto {
  @ApiProperty({ description: 'Patient identifier (anonymized)' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toString().trim())
  patientId: string;

  @ApiProperty({ description: 'Medical record number' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toString().trim())
  medicalRecordNumber: string;

  @ApiProperty({ description: 'Encounter date' })
  @IsDateString()
  encounterDate: string;

  @ApiProperty({ description: 'Chief complaint' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toString().trim())
  chiefComplaint: string;

  @ApiProperty({ description: 'Medical codes', type: [MedicalCodeDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MedicalCodeDto)
  medicalCodes: MedicalCodeDto[];

  @ApiProperty({ description: 'Emergency level', enum: EmergencyLevel })
  @IsEnum(EmergencyLevel)
  emergencyLevel: EmergencyLevel;

  @ApiProperty({ description: 'Attending physician ID' })
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.toString().trim())
  attendingPhysicianId: string;

  @ApiProperty({ description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toString().trim())
  notes?: string;
}
