import { IsString, IsNotEmpty, IsOptional, IsEmail, IsPhoneNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHospitalDto {
  @ApiProperty({ description: 'Hospital name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Hospital description', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Complete hospital address' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'Contact phone number' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ description: 'Contact email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Hospital website URL', required: false })
  @IsString()
  @IsOptional()
  website?: string;

  @ApiProperty({ description: 'Hospital license number' })
  @IsString()
  @IsNotEmpty()
  licenseNumber: string;

  @ApiProperty({ description: 'Total bed capacity' })
  @IsNotEmpty()
  totalBeds: number;

  @ApiProperty({ description: 'Additional hospital settings', required: false })
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;
}

export class UpdateHospitalDto extends CreateHospitalDto {
  @ApiProperty({ description: 'Hospital status', required: false })
  @IsString()
  @IsOptional()
  status?: 'active' | 'inactive' | 'maintenance';
}