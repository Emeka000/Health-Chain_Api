import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CheckDrugSafetyDto {
  @ApiProperty({ example: 'Ibuprofen', description: 'Drug name to check' })
  @IsString()
  drug: string;

  @ApiProperty({
    example: ['asthma', 'liver disease'],
    description: 'Patient conditions or allergies',
  })
  @IsArray()
  @IsString({ each: true })
  conditions: string[];
}
