import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsDateString, IsEnum, IsUUID, Length, Matches } from 'class-validator';

export enum GenderType {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  UNKNOWN = 'unknown'
}

export class CreatePatientDto {
  @ApiProperty({
    description: 'Patient first name (PHI - Protected Health Information)',
    example: 'John',
    minLength: 1,
    maxLength: 50,
    type: String,
    required: true,
    security: 'PHI - Requires appropriate authorization'
  })
  @IsString()
  @Length(1, 50)
  firstName: string;

  @ApiProperty({
    description: 'Patient last name (PHI - Protected Health Information)',
    example: 'Doe',
    minLength: 1,
    maxLength: 50,
    type: String,
    required: true,
    security: 'PHI - Requires appropriate authorization'
  })
  @IsString()
  @Length(1, 50)
  lastName: string;

  @ApiProperty({
    description: 'Patient date of birth (PHI - HIPAA Protected)',
    example: '1980-01-01',
    type: String,
    format: 'date',
    required: true,
    security: 'PHI - Age calculated, DOB protected'
  })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({
    description: 'Patient gender following FHIR R4 AdministrativeGender ValueSet',
    enum: GenderType,
    example: GenderType.MALE,
    required: true
  })
  @IsEnum(GenderType)
  gender: GenderType;

  @ApiPropertyOptional({
    description: 'Patient email address (PHI - Protected Contact Information)',
    example: 'patient@example.com',
    type: String,
    format: 'email',
    security: 'PHI - Contact information protected'
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    description: 'Patient phone number (PHI - Protected Contact Information)',
    example: '(555) 123-4567',
    pattern: '^\\([0-9]{3}\\) [0-9]{3}-[0-9]{4}$',
    security: 'PHI - Contact information protected'
  })
  @IsOptional()
  @Matches(/^\([0-9]{3}\) [0-9]{3}-[0-9]{4}$/)
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Medical Record Number (MRN) - Unique patient identifier',
    example: 'MRN-2024-001234',
    pattern: '^MRN-[0-9]{4}-[0-9]{6}$'
  })
  @IsOptional()
  @Matches(/^MRN-[0-9]{4}-[0-9]{6}$/)
  medicalRecordNumber?: string;
}
