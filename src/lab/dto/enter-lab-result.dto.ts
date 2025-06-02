import { IsNumber, IsObject } from 'class-validator';

export class EnterLabResultDto {
  @IsNumber()
  testOrderId: number;

  @IsObject()
  results: Record<string, number>;
}
