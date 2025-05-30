import {
  IsString,
  IsEmail,
  IsPhoneNumber,
  IsDate,
  IsOptional,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

class EmergencyContactDto {
  @IsString()
  name: string;

  @IsString()
  relationship: string;

  @IsPhoneNumber()
  phone: string;
}

class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zipCode: string;
}

class ContactInfoDto {
  @ValidateNested()
  @Type(() => EmergencyContactDto)
  emergencyContact: EmergencyContactDto;

  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

class CredentialsDto {
  @IsString()
  medicalSchool: string;

  @IsString()
  graduationYear: number;

  @IsString()
  residency: string;

  @IsOptional()
  @IsString()
  fellowship?: string;

  @IsArray()
  @IsString({ each: true })
  boardCertifications: string[];
}

class CreateLicenseDto {
  @IsString()
  licenseType: string;

  @IsString()
  licenseNumber: string;

  @IsString()
  issuingAuthority: string;

  @IsString()
  issuingState: string;

  @IsDate()
  @Type(() => Date)
  issueDate: Date;

  @IsDate()
  @Type(() => Date)
  expiryDate: Date;
}

export class CreateDoctorDto {
  @IsString()
  employeeId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phone: string;

  @IsDate()
  @Type(() => Date)
  dateOfBirth: Date;

  @IsDate()
  @Type(() => Date)
  hireDate: Date;

  @IsUUID()
  departmentId: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  specialtyIds?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => CredentialsDto)
  credentials?: CredentialsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo?: ContactInfoDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateLicenseDto)
  licenses?: CreateLicenseDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
