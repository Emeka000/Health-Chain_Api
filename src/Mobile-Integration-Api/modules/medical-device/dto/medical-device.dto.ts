import { IsString, IsObject, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeviceRegistrationDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  serialNumber: string;

  @ApiProperty()
  @IsString()
  patientId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  specifications?: any;
}

export class DeviceDataDto {
  @ApiProperty()
  @IsString()
  deviceId: string;

  @ApiProperty()
  @IsObject()
  readings: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  patientId?: string;
}