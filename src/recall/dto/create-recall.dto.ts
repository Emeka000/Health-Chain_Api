import { IsString, IsDateString } from 'class-validator';

export class CreateRecallDto {
  @IsString()
  lotNumber: string;

  @IsString()
  reason: string;

  @IsDateString()
  recallDate: string;
}
