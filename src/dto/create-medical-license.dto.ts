import { IsString, IsDateString, IsEnum } from 'class-validator';
import { LicenseStatus } from '../entities/medical-license.entity';

export class CreateMedicalLicenseDto {
  @IsString()
  licenseNumber: string;

  @IsString()
  licenseType: string;

  @IsString()
  issuingState: string;

  @IsDateString()
  issuedDate: string;

  @IsDateString()
  expirationDate: string;

  @IsEnum(LicenseStatus)
  status: LicenseStatus;
}