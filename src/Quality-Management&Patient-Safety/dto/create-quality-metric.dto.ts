export class CreateQualityMetricDto {
    @IsEnum(MetricType)
    type: MetricType;
  
    @IsString()
    name: string;
  
    @IsNumber()
    value: number;
  
    @IsNumber()
    target: number;
  
    @IsOptional()
    @IsUUID()
    departmentId?: string;
  
    @IsDateString()
    measurementDate: string;
  
    @IsOptional()
    @IsString()
    notes?: string;
  }
  