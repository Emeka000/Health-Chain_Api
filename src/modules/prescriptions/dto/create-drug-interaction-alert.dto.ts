import { IsNotEmpty, IsString, IsOptional, IsEnum, IsUUID, IsBoolean, IsArray } from 'class-validator';
import { 
  InteractionSeverity, 
  InteractionType, 
  AlertStatus 
} from '../entities/drug-interaction-alert.entity';

export class CreateDrugInteractionAlertDto {
  @IsNotEmpty()
  @IsUUID()
  patientId: string;

  @IsNotEmpty()
  @IsEnum(InteractionType)
  interactionType: InteractionType;

  @IsNotEmpty()
  @IsEnum(InteractionSeverity)
  severity: InteractionSeverity;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  evidenceText?: string;

  @IsOptional()
  @IsString()
  recommendedAction?: string;

  @IsOptional()
  @IsEnum(AlertStatus)
  status?: AlertStatus;

  @IsNotEmpty()
  @IsArray()
  @IsUUID('all', { each: true })
  relatedPrescriptionIds: string[];

  @IsOptional()
  @IsBoolean()
  requiresAcknowledgment?: boolean;
}
