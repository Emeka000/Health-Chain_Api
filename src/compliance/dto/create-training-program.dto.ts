import {
    IsString,
    IsEnum,
    IsNumber,
    IsBoolean,
    IsOptional,
    IsArray,
    IsObject,
    Min,
    Max,
    MinLength,
    MaxLength,
  } from 'class-validator';
  import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
  import {
    TrainingType,
    TrainingDeliveryMethod,
    ProgramStatus,
  } from '../training/entities/training-program.entity';
  
  export class CreateTrainingProgramDto {
    @ApiProperty({ example: 'HIPAA-BASIC-001', description: 'Unique program code' })
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    code: string;
  
    @ApiProperty({ example: 'HIPAA Basic Training', description: 'Program title' })
    @IsString()
    @MinLength(5)
    @MaxLength(200)
    title: string;
  
    @ApiProperty({ 
      example: 'Comprehensive HIPAA training covering privacy and security requirements',
    })
    @IsString()
    @MinLength(10)
    description: string;
  
    @ApiProperty({ enum: TrainingType })
    @IsEnum(TrainingType)
    type: TrainingType;
  
    @ApiProperty({ enum: TrainingDeliveryMethod })
    @IsEnum(TrainingDeliveryMethod)
    deliveryMethod: TrainingDeliveryMethod;
  
    @ApiProperty({ example: 4, description: 'Duration in hours' })
    @IsNumber()
    @Min(0.5)
    @Max(40)
    durationHours: number;
  
    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    mandatory?: boolean = false;
  
    @ApiPropertyOptional({ default: true })
    @IsOptional()
    @IsBoolean()
    recertificationRequired?: boolean = true;
  
    @ApiPropertyOptional({ example: 12, description: 'Recertification period in months' })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(60)
    recertificationPeriodMonths?: number;
  
    @ApiProperty({ example: 80, description: 'Passing score percentage' })
    @IsNumber()
    @Min(0)
    @Max(100)
    passingScore: number;
  
    @ApiPropertyOptional({ example: 3, default: 3 })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(10)
    maxAttempts?: number = 3;
  
    @ApiPropertyOptional({ 
      example: ['nurse', 'doctor', 'admin'],
      description: 'Target roles for this training'
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    targetRoles?: string[];
  
    @ApiPropertyOptional({ 
      example: ['BASIC-ORIENTATION'],
      description: 'Prerequisite training codes'
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    prerequisites?: string[];
  
    @ApiPropertyOptional({ description: 'Learning objectives' })
    @IsOptional()
    @IsString()
    learningObjectives?: string;
  
    @ApiPropertyOptional({ description: 'Training content and materials' })
    @IsOptional()
    @IsObject()
    content?: Record<string, any>;
  
    @ApiPropertyOptional({ enum: ProgramStatus, default: ProgramStatus.ACTIVE })
    @IsOptional()
    @IsEnum(ProgramStatus)
    status?: ProgramStatus = ProgramStatus.ACTIVE;
  }
  