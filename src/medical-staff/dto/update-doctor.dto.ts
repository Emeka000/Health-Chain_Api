import { PartialType } from '@nestjs/mapped-types';
import { CreateDoctorDto } from './create-doctor.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { DoctorStatus } from '../enums/doctor-status.enum';

export class UpdateDoctorDto extends PartialType(CreateDoctorDto) {
  @IsOptional()
  @IsEnum(DoctorStatus)
  status?: DoctorStatus;
}
