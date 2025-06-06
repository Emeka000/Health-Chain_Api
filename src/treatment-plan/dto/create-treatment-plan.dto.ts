import { IsString } from "class-validator";

export class CreateTreatmentPlanDto {
  @IsString()
  diagnosisId: string;

  @IsString()
  objectives: string;

  @IsString()
  interventions: string;

  @IsString()
  responsibleDoctorId: string;
}