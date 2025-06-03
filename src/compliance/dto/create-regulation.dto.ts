import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  IsObject,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RegulationType,
  RegulationStatus,
} from '../entities/regulation.entity';

export class CreateRegulationDto {
  @ApiProperty({
    example: 'HIPAA-164.502',
    description: 'Unique regulation code',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  code: string;

  @ApiProperty({
    example: 'Uses and Disclosures of PHI',
    description: 'Regulation title',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    example:
      'General requirements for uses and disclosures of protected health information',
    description: 'Detailed description',
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ enum: RegulationType, example: RegulationType.HIPAA })
  @IsEnum(RegulationType)
  type: RegulationType;

  @ApiPropertyOptional({
    enum: RegulationStatus,
    default: RegulationStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(RegulationStatus)
  status?: RegulationStatus = RegulationStatus.ACTIVE;

  @ApiProperty({ example: '2024-01-01', description: 'Effective date' })
  @IsDateString()
  effectiveDate: string;

  @ApiPropertyOptional({
    example: '2025-12-31',
    description: 'Expiration date',
  })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiProperty({ example: 'Department of Health and Human Services' })
  @IsString()
  regulatoryBody: string;

  @ApiProperty({ example: '1.0', description: 'Version number' })
  @IsString()
  version: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
