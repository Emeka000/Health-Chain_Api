import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PrescribedDrug {
  @ApiProperty()
  @IsString()
  drugId: string;

  @ApiProperty()
  @IsString()
  dosage: string;

  @ApiProperty()
  @IsString()
  frequency: string;

  @ApiProperty()
  @IsString()
  duration: string;
}

export class CreatePrescriptionDto {
  @ApiProperty()
  @IsString()
  patientId: string;

  @ApiProperty({ type: [PrescribedDrug] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PrescribedDrug)
  drugs: PrescribedDrug[];
}
