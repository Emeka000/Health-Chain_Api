import { IsString, IsBoolean, IsOptional  } from "class-validator";

export class UpdateProcedureStatusDto {
  @IsBoolean()
  isCompleted: boolean;

  @IsOptional()
  @IsString()
  outcomeNotes?: string;
}