import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class CheckDrugInteractionDto {
  @ApiProperty({
    example: ['Amoxicillin', 'Ibuprofen'],
    description: 'List of drug names to check interactions between',
  })
  @IsArray()
  @IsString({ each: true })
  drugs: string[];
}
