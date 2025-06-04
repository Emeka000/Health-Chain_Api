import { PartialType } from '@nestjs/mapped-types';
import { IsUUID, IsOptional, IsDateString } from 'class-validator';
import { CreateDrugInteractionAlertDto } from './create-drug-interaction-alert.dto';

export class UpdateDrugInteractionAlertDto extends PartialType(CreateDrugInteractionAlertDto) {
  @IsOptional()
  @IsUUID()
  overriddenBy?: string;

  @IsOptional()
  @IsString()
  overrideReason?: string;

  @IsOptional()
  @IsDateString()
  overriddenAt?: string;

  @IsOptional()
  @IsUUID()
  acknowledgedBy?: string;

  @IsOptional()
  @IsDateString()
  acknowledgedAt?: string;
}
