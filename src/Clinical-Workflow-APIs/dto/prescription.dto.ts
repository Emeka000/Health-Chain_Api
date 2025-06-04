import { IsString, IsNumber, IsDate, IsEnum, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePrescriptionDto {
  @ApiProperty()
  @IsUUID()
  patientId: string;

  @ApiProperty()
  @IsUUID()
  physicianId: string;

  @ApiProperty()
  @IsUUID()
  medicationId: string;

  @ApiProperty()
  @IsString()
  dosage: string;

  @ApiProperty()
  @IsString()
  frequency: string;

  @ApiProperty()
  @IsString()
  duration: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty()
  @IsNumber()
  quantity: number;

  @ApiProperty()
  @IsNumber()
  refills: number;

  @ApiProperty()
  @Type(() => Date)
  @IsDate()
  prescribedDate: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expiryDate?: Date;
}
