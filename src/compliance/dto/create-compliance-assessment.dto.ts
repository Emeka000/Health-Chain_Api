import {
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsObject,
  IsBoolean,
  IsDecimal,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AssessmentStatus,
  ComplianceScore,
} from '../entities/compliance-assessment.entity';

export class CreateComplianceAssessmentDto {
  @ApiProperty({ example: 1, description: 'Compliance requirement ID' })
  @IsNumber()
  requirementId: number;

  @ApiProperty({ example: '2024-01-15', description: 'Assessment date' })
  @IsDateString()
  assessmentDate: string;

  @ApiProperty({ example: '2024-01-30', description: 'Due date' })
  @IsDateString()
  dueDate: string;

  @ApiProperty({ example: 1, description: 'Assessor user ID' })
  @IsNumber()
  assessedBy: number;

  @ApiPropertyOptional({
    enum: AssessmentStatus,
    default: AssessmentStatus.SCHEDULED,
  })
  @IsOptional()
  @IsEnum(AssessmentStatus)
  status?: AssessmentStatus = AssessmentStatus.SCHEDULED;

  @ApiPropertyOptional({ enum: ComplianceScore })
  @IsOptional()
  @IsEnum(ComplianceScore)
  score?: ComplianceScore;

  @ApiPropertyOptional({ description: 'Assessment notes' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Evidence documentation' })
  @IsOptional()
  @IsString()
  evidence?: string;

  @ApiPropertyOptional({ description: 'Supporting documentation' })
  @IsOptional()
  @IsObject()
  documentation?: Record<string, any>;

  @ApiPropertyOptional({ example: 85.5, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  @Min(0)
  @Max(100)
  scorePercentage?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  remediationRequired?: boolean = false;

  @ApiPropertyOptional({ description: 'Remediation deadline if required' })
  @IsOptional()
  @IsDateString()
  remediationDeadline?: string;
}
