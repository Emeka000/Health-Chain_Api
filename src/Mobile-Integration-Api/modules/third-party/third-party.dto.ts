import { IsString, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookDto {
  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsObject()
  data: any;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  timestamp?: string;
}

export class IntegrationConfigDto {
  @ApiProperty()
  @IsString()
  type: string;

  @ApiProperty()
  @IsString()
  apiKey: string;

  @ApiProperty()
  @IsString()
  baseUrl: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsObject()
  additionalConfig?: any;
}