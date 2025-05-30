import {
  IsString,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

class DayHoursDto {
  @IsString()
  start: string;

  @IsString()
  end: string;
}

class OperatingHoursDto {
  @ValidateNested()
  @Type(() => DayHoursDto)
  monday: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  tuesday: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  wednesday: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  thursday: DayHoursDto;

  @ValidateNested()
  @Type(() => DayHoursDto)
  friday: DayHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DayHoursDto)
  saturday?: DayHoursDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DayHoursDto)
  sunday?: DayHoursDto;
}

class ContactInfoDto {
  @IsString()
  phone: string;

  @IsString()
  email: string;

  @IsString()
  location: string;
}

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  headOfDepartmentId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo?: ContactInfoDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OperatingHoursDto)
  operatingHours?: OperatingHoursDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
