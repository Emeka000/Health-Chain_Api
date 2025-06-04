mport { IsString, IsDateString, IsOptional, IsIn } from 'class-validator';

export class CreateMedicalRecordDto {
  @IsIn(['diagnosis', 'prescription', 'lab_result', 'visit_note'])
  recordType: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  recordDate: string;

  @IsOptional()
  @IsString()
  providerId?: string;

  @IsOptional()
  @IsString()
  providerName?: string;

  @IsOptional()
  metadata?: any;
}
