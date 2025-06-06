import { IsString, IsNumber, Min, Max } from 'class-validator';

export class RecordOutcomeDto {
  @IsString()
  treatmentPlanId: string;

  @IsString()
  outcomeSummary: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  improvementScore: number;
}
