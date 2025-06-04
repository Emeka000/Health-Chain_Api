import { IsString, IsDateString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PatientStatus } from '../../../common/enums';

export class PatientSearchDto {
  @ApiProperty({ example: 'MRN123456', required: false })
  @IsOptional()
  @IsString()
  medicalRecordNumber?: string;

  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '1980-05-15', required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ enum: PatientStatus, example: PatientStatus.ADMITTED, required: false })
  @IsOptional()
  @IsEnum(PatientStatus)
  status?: PatientStatus;

  @ApiProperty({ example: '101A', required: false })
  @IsOptional()
  @IsString()
  roomNumber?: string;

  @ApiProperty({ example: 'Smith', required: false })
  @IsOptional()
  @IsString()
  attendingPhysician?: string;
}
