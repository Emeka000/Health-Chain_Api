import {
  IsString,
  IsNumber,
  IsDate,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MetricType } from '../enums/metric-type.enum';

class AdditionalDataDto {
  @IsOptional()
  @IsNumber()
  patientCount?: number;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH'])
  caseComplexity?: 'LOW' | 'MEDIUM' | 'HIGH';

  @IsOptional()
  @IsNumber()
  departmentAverage?: number;

  @IsOptional()
  @IsNumber()
  benchmarkValue?: number;

  @IsOptional()
  @IsNumber()
  improvementTarget?: number;
}

export class CreatePerformanceMetricDto {
  @IsUUID()
  doctorId: string;

  @IsEnum(MetricType)
  metricType: MetricType;

  @IsNumber()
  value: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsDate()
  @Type(() => Date)
  recordedDate: Date;

  @IsString()
  recordedBy: string;

  @IsOptional()
  @IsString()
  period?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AdditionalDataDto)
  additionalData?: AdditionalDataDto;

  @IsOptional()
  @IsString()
  notes?: string;
}
