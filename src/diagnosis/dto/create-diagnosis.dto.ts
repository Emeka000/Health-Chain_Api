import { IsString } from "class-validator";

export class CreateDiagnosisDto {
  @IsString()
  icd10Code: string;

  @IsString()
  title: string;

  @IsString()
  notes: string;

  @IsString()
  patientId: string;
}