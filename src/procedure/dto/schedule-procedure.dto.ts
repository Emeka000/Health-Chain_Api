import { IsString, IsDateString } from "class-validator";

export class ScheduleProcedureDto {
  @IsString()
  treatmentPlanId: string;

  @IsString()
  procedureName: string;

  @IsDateString()
  scheduledAt: Date;
}