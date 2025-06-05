import { IsEnum, IsString, IsOptional, IsDateString, IsUUID } from 'class-validator';

export class CreateIncidentReportDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(IncidentType)
  type: IncidentType;

  @IsEnum(IncidentSeverity)
  severity: IncidentSeverity;

  @IsOptional()
  @IsUUID()
  patientId?: string;

  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @IsString()
  reportedBy: string;

  @IsDateString()
  incidentDate: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;
}
