import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString, IsUUID, IsDateString } from 'class-validator';
import { CreatePrescriptionDto } from './create-prescription.dto';
import { PrescriptionStatus } from '../enums/prescription-status.enum';

export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {
  @IsOptional()
  @IsEnum(PrescriptionStatus)
  status?: PrescriptionStatus;

  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @IsOptional()
  @IsUUID()
  authorizingPharmacistId?: string;

  @IsOptional()
  @IsDateString()
  verificationTimestamp?: string;

  @IsOptional()
  @IsUUID()
  updatedBy: string;
}
