import {
  IsEnum,
  IsUUID,
  IsString,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { SeverityLevel } from '../entities/adverse-drug-reaction.entity';

export class CreateAdverseDrugReactionDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  medicationId: string;

  @IsString()
  reaction: string;

  @IsEnum(SeverityLevel)
  severity: SeverityLevel;

  @IsDateString()
  onsetDate: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  reporterId: string;

  @IsString()
  reporterName: string;
}
