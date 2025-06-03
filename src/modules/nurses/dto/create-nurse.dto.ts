import {
  IsString,
  IsEmail,
  IsEnum,
  IsArray,
  IsOptional,
  IsDateString,
  IsPhoneNumber,
  IsObject,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  UserRole,
  CertificationType,
  SpecialtyType,
} from '../../../common/enums';

export class CreateNurseDto {
  @ApiProperty({ example: 'EMP001' })
  @IsString()
  employeeId: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john.doe@hospital.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  password: string;

  @ApiProperty({ example: '+1234567890' })
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({ enum: UserRole, example: UserRole.REGISTERED_NURSE })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({
    enum: CertificationType,
    isArray: true,
    example: [CertificationType.RN, CertificationType.BLS],
  })
  @IsArray()
  @IsEnum(CertificationType, { each: true })
  certifications: CertificationType[];

  @ApiProperty({
    enum: SpecialtyType,
    isArray: true,
    example: [SpecialtyType.ICU, SpecialtyType.CARDIOLOGY],
  })
  @IsArray()
  @IsEnum(SpecialtyType, { each: true })
  specialties: SpecialtyType[];

  @ApiProperty({ example: '2023-01-15' })
  @IsDateString()
  hireDate: string;

  @ApiProperty({ example: '2025-12-31', required: false })
  @IsOptional()
  @IsDateString()
  licenseExpiryDate?: string;

  @ApiProperty({
    example: 1.0,
    description: 'Work capacity (0.5 = part-time, 1.0 = full-time)',
  })
  @IsNumber()
  @Min(0.1)
  @Max(2.0)
  workloadCapacity: number;

  @ApiProperty({
    example: {
      preferredShifts: ['day', 'evening'],
      preferredDepartments: ['ICU', 'ER'],
      availabilityDays: ['monday', 'tuesday', 'wednesday'],
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  preferences?: {
    preferredShifts?: string[];
    preferredDepartments?: string[];
    availabilityDays?: string[];
  };

  @ApiProperty({
    example: {
      name: 'Jane Doe',
      relationship: 'Spouse',
      phoneNumber: '+1987654321',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
}
