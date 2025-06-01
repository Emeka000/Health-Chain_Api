import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSpecimenDto {
  @IsString()
  @IsNotEmpty()
  barcode: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsNumber()
  labTestId: number;
}
