import { IsString, IsEnum, IsOptional, IsNumber, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDiagnosisDto {
  @ApiProperty()
  @IsUUID()
  patientId: string;

  @ApiProperty()
  @IsUUID()
  physicianId: string;

  @ApiProperty()
  @IsString()
  icdCode: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ enum: ['primary', 'secondary', 'differential'] })
  @IsEnum(['primary', 'secondary', 'differential'])
  type: string;

  @ApiProperty({ enum: ['confirmed', 'provisional', 'rule_out'] })
  @IsEnum(['confirmed', 'provisional', 'rule_out'])
  status: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber()
  severity: number;
}

export class UpdateDiagnosisDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ enum: ['confirmed', 'provisional', 'rule_out'], required: false })
  @IsOptional()
  @IsEnum(['confirmed', 'provisional', 'rule_out'])
  status?: string;

  @ApiProperty({ minimum: 1, maximum: 5, required: false })
  @IsOptional()
  @IsNumber()
  severity?: number;
}
