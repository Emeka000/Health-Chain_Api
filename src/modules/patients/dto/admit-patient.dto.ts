import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PatientStatus } from '../../../common/enums';

export class AdmitPatientDto {
  @ApiProperty({ example: 'patient-uuid' })
  @IsString()
  patientId: string;

  @ApiProperty({ enum: PatientStatus, example: PatientStatus.ADMITTED })
  @IsEnum(PatientStatus)
  status: PatientStatus;

  @ApiProperty({ example: '101A' })
  @IsString()
  roomNumber: string;

  @ApiProperty({ example: 'Dr. Smith' })
  @IsString()
  attendingPhysician: string;

  @ApiProperty({ example: 'nurse-uuid' })
  @IsOptional()
  @IsString()
  primaryNurse?: string;

  @ApiProperty({ example: 'Acute appendicitis' })
  @IsString()
  admissionReason: string;

  @ApiProperty({ example: '2023-06-15T14:30:00Z' })
  @IsDateString()
  admissionDate: string;

  @ApiProperty({ example: '2023-06-20T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  expectedDischargeDate?: string;

  @ApiProperty({ example: 'Regular monitoring required', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
