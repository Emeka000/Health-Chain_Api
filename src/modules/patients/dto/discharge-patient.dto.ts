import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PatientStatus } from '../../../common/enums';

export class DischargePatientDto {
  @ApiProperty({ example: 'patient-uuid' })
  @IsString()
  patientId: string;

  @ApiProperty({ enum: PatientStatus, example: PatientStatus.DISCHARGED })
  @IsEnum(PatientStatus)
  status: PatientStatus;

  @ApiProperty({ example: '2023-06-20T10:00:00Z' })
  @IsDateString()
  dischargeDate: string;

  @ApiProperty({ example: 'Recovery complete', required: false })
  @IsOptional()
  @IsString()
  dischargeReason?: string;

  @ApiProperty({ example: 'Follow up in 2 weeks', required: false })
  @IsOptional()
  @IsString()
  followUpInstructions?: string;

  @ApiProperty({ example: 'Dr. Smith', required: false })
  @IsOptional()
  @IsString()
  dischargingPhysician?: string;

  @ApiProperty({ example: 'Medication regimen to continue at home', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
