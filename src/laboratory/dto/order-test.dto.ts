import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class OrderTestDto {
  @ApiProperty()
  @IsString()
  patientId: string;

  @ApiProperty({ example: [1, 2, 3] })
  @IsArray()
  testIds: number[];
}
