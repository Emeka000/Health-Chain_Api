import {
    IsString,
    IsEnum,
    IsNumber,
    IsDateString,
    IsOptional,
    IsBoolean,
    IsObject,
    Min,
    Max,
  } from 'class-validator';
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  import {
    RequirementType,
    ComplianceLevel,
    RiskLevel,
  } from '../entities/compliance-requirement.entity';
  
  export class CreateComplianceRequirementDto {
    @ApiProperty({ example: 1, description: 'Regulation ID' })
    @IsNumber()
    regulationId: number;
  
    @ApiProperty({ example: 'HIPAA-164.502.a', description: 'Unique requirement code' })
    @IsString()
    code: string;
  
    @ApiProperty({ example: 'Standard: Uses and disclosures' })
    @IsString()
    title: string;
  
    @ApiProperty({ 
      example: 'Covered entity may use or disclose PHI only as permitted or required',
    })
    @IsString()
    description: string;
  
    @ApiProperty({ enum: RequirementType })
    @IsEnum(RequirementType)
    type: RequirementType;
  
    @ApiProperty({ enum: ComplianceLevel })
    @IsEnum(ComplianceLevel)
    complianceLevel: ComplianceLevel;
  
    @ApiProperty({ enum: RiskLevel })
    @IsEnum(RiskLevel)
    riskLevel: RiskLevel;
  
    @ApiPropertyOptional({ description: 'Implementation guidance' })
    @IsOptional()
    @IsString()
    implementationGuidance?: string;
  
    @ApiProperty({ example: 90, description: 'Assessment frequency in days' })
    @IsNumber()
    @Min(1)
    @Max(365)
    assessmentFrequencyDays: number;
  
    @ApiPropertyOptional({ description: 'Technical controls configuration' })
    @IsOptional()
    @IsObject()
    controls?: Record<string, any>;
  
    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    active?: boolean = true;
  }