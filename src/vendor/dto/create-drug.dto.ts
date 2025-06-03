import { IsString, IsDateString, IsNumber, Min } from 'class-validator';

export class CreateDrugDto {
  @IsString()
  name: string;

  @IsString()
  lotNumber: string;

  @IsDateString()
  expirationDate: string;

  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNumber()
  @Min(0)
  reorderPoint: number;

  @IsNumber()
  @Min(0)
  cost: number;

  @IsNumber()
  vendorId: number;
}
