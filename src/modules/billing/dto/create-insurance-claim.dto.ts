import {
  IsString,
  IsNumber,
  IsArray,
  IsDate,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SupportingDocumentDto {
  @IsString()
  documentType: string;

  @IsString()
  documentUrl: string;
}

export class CreateInsuranceClaimDto {
  @IsString()
  invoiceId: string;

  @IsString()
  patientId: string;

  @IsString()
  insuranceProviderId: string;

  @IsString()
  policyNumber: string;

  @IsNumber()
  claimAmount: number;

  @IsArray()
  @IsString({ each: true })
  diagnosisCodes: string[];

  @IsArray()
  @IsString({ each: true })
  procedureCodes: string[];

  @IsDate()
  @Type(() => Date)
  serviceDate: Date;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SupportingDocumentDto)
  supportingDocuments?: SupportingDocumentDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
