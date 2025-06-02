import {
    IsOptional,
    IsString,
    IsEnum,
    IsDateString,
    IsArray,
    IsUUID,
    IsBoolean
  } from 'class-validator';
  import { Transform } from 'class-transformer';
  import { RecordType, RecordStatus } from '../../entities/medical-record.entity';
  
  export class SearchMedicalRecordsDto {
    @IsOptional()
    @IsUUID()
    patientId?: string;
  
    @IsOptional()
    @IsUUID()
    doctorId?: string;
  
    @IsOptional()
    @IsEnum(RecordType)
    recordType?: RecordType;
  
    @IsOptional()
    @IsEnum(RecordStatus)
    status?: RecordStatus;
  
    @IsOptional()
    @IsString()
    searchTerm?: string;
  
    @IsOptional()
    @IsDateString()
    fromDate?: string;
  
    @IsOptional()
    @IsDateString()
    toDate?: string;
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => typeof value === 'string' ? [value] : value)
    diagnoses?: string[];
  
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => typeof value === 'string' ? [value] : value)
    symptoms?: string[];
  
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    includeConfidential?: boolean;
  
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    page?: number = 1;
  
    @IsOptional()
    @Transform(({ value }) => parseInt(value))
    limit?: number = 10;
  
    @IsOptional()
    @IsString()
    sortBy?: string = 'createdAt';
  
    @IsOptional()
    @IsString()
    sortOrder?: 'ASC' | 'DESC' = 'DESC';
  }