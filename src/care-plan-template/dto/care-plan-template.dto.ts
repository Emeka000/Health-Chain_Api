import { IsString } from "class-validator";

export class CreateCarePlanTemplateDto {
  @IsString()
  name: string;

  @IsString()
  defaultObjectives: string;

  @IsString()
  defaultInterventions: string;
}