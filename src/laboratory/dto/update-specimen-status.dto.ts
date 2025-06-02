import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateSpecimenStatusDto {
  @ApiProperty()
  @IsString()
  specimenId: string;

  @ApiProperty({ example: 'in-transit' }) // collected, received, in-analysis, completed
  @IsString()
  status: string;
}
