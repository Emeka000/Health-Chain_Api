import { IsString, IsNumber, IsDateString, Min } from 'class-validator';

export class LogWasteDto {
  @IsNumber()
  drugId: number;

  @IsString()
  reason: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsDateString()
  disposedOn: string;
}
