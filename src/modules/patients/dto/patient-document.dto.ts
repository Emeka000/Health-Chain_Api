import { IsString, IsOptional, IsEnum, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PatientDocumentDto {
  @ApiProperty({ description: 'Patient ID' })
  @IsUUID()
  patientId: string;

  @ApiProperty({ description: 'Document type (photo, identification, etc.)' })
  @IsString()
  documentType: string;

  @ApiProperty({ description: 'Optional description of the document', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}

export class VerifyPatientIdentityDto {
  @ApiProperty({ description: 'Whether the identity is verified' })
  @IsBoolean()
  verified: boolean;

  @ApiProperty({ description: 'Additional notes about verification', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}
