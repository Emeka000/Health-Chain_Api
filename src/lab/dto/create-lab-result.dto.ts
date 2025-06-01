import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsDate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ResultFlag } from '../entities/test-result.entity';

export class CreateTestResultDto {
  @IsString()
  @IsNotEmpty()
  parameterId: string;

  @IsString()
  @IsNotEmpty()
  parameterName: string;

  @IsString()
  @IsNotEmpty()
  value: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsString()
  @IsOptional()
  referenceRange?: string;

  @IsString()
  @IsOptional()
  flag?: ResultFlag;

  @IsString()
  @IsOptional()
  comments?: string;
}

export class CreateLabResultDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  testId: string;

  @IsString()
  @IsNotEmpty()
  specimenId: string;

  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsString()
  @IsNotEmpty()
  performedBy: string;

  @IsDate()
  @Type(() => Date)
  performedDate: Date;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTestResultDto)
  results: CreateTestResultDto[];

  @IsString()
  @IsOptional()
  comments?: string;
}
