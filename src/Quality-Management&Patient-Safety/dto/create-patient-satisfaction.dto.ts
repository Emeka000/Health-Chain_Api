export class CreatePatientSatisfactionDto {
    @IsUUID()
    patientId: string;
  
    @IsOptional()
    @IsUUID()
    departmentId?: string;
  
    @IsNumber()
    overallRating: number;
  
    @IsNumber()
    careQualityRating: number;
  
    @IsNumber()
    communicationRating: number;
  
    @IsNumber()
    facilityRating: number;
  
    @IsOptional()
    @IsString()
    comments?: string;
  
    @IsOptional()
    @IsString()
    suggestions?: string;
  
    @IsDateString()
    surveyDate: string;
  }
  