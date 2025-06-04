import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PatientStatus } from '../../../common/enums';

export class TransferPatientDto {
  @ApiProperty({ example: 'patient-uuid' })
  @IsString()
  patientId: string;

  @ApiProperty({ enum: PatientStatus, example: PatientStatus.TRANSFERRED })
  @IsEnum(PatientStatus)
  status: PatientStatus;

  @ApiProperty({ example: '101A' })
  @IsString()
  fromRoomNumber: string;

  @ApiProperty({ example: '205B' })
  @IsString()
  toRoomNumber: string;

  @ApiProperty({ example: 'Dr. Smith' })
  @IsString()
  fromAttendingPhysician: string;

  @ApiProperty({ example: 'Dr. Johnson' })
  @IsString()
  toAttendingPhysician: string;

  @ApiProperty({ example: 'nurse-uuid', required: false })
  @IsOptional()
  @IsString()
  toPrimaryNurse?: string;

  @ApiProperty({ example: '2023-06-18T14:30:00Z' })
  @IsDateString()
  transferDate: string;

  @ApiProperty({ example: 'Patient requires specialized care', required: false })
  @IsOptional()
  @IsString()
  transferReason?: string;

  @ApiProperty({ example: 'Transfer to cardiology department', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
