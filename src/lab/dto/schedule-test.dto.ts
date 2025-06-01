import { IsString, IsNotEmpty, IsDateString, IsNumber } from 'class-validator';

export class ScheduleTestDto {
  @IsString()
  @IsNotEmpty()
  patientId: string;

  @IsDateString()
  scheduledAt: string;

  @IsNumber()
  labTestId: number;

  @IsNumber()
  specimenId: number;
}
