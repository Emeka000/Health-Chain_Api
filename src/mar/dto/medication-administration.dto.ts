import {
  IsEnum,
  IsUUID,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import {
  AdministrationStatus,
  NotGivenReason,
} from '../entities/medication-administration.entity';

export class CreateMedicationAdministrationDto {
  @IsUUID()
  patientId: string;

  @IsUUID()
  orderId: string;

  @IsDateString()
  scheduledTime: string;

  @IsOptional()
  @IsDateString()
  actualTime?: string;

  @IsEnum(AdministrationStatus)
  status: AdministrationStatus;

  @IsOptional()
  @IsEnum(NotGivenReason)
  notGivenReason?: NotGivenReason;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  nurseId: string;

  @IsString()
  nurseName: string;

  @IsOptional()
  @IsString()
  witnessId?: string;

  @IsOptional()
  @IsString()
  witnessName?: string;

  @IsOptional()
  @IsBoolean()
  barcodeVerified?: boolean;

  @IsOptional()
  @IsString()
  scannedBarcode?: string;
}

export class VerifyBarcodeDto {
  @IsString()
  barcode: string;

  @IsUUID()
  medicationOrderId: string;
}
