import {
  IsString,
  IsNumber,
  IsDate,
  IsEnum,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EducationType } from '../enums/education-type.enum';

class EducationDetailsDto {
  @IsNumber()
  duration: number;

  @IsEnum(['ONLINE', 'IN_PERSON', 'HYBRID'])
  format: 'ONLINE' | 'IN_PERSON' | 'HYBRID';

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  documentUrl?: string;
}

export class CreateContinuingEducationDto {
  @IsUUID()
  doctorId: string;

  @IsEnum(EducationType)
  educationType: EducationType;

  @IsString()
  title: string;

  @IsString()
  provider: string;

  @IsNumber()
  credits: number;

  @IsDate()
  @Type(() => Date)
  completionDate: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiryDate?: Date;

  @IsOptional()
  @IsString()
  certificateNumber?: string;

  @IsOptional()
  @IsString()
  accreditationBody?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => EducationDetailsDto)
  details?: EducationDetailsDto;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  notes?: string;
}
