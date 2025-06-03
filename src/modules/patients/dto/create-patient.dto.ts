import {
  IsString,
  IsDateString,
  IsEnum,
  IsOptional,
  IsObject,
  IsArray,
  IsEmail,
  IsBoolean,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Priority, PatientStatus, BloodType, MaritalStatus, LanguagePreference } from '../../../common/enums';

export class CreatePatientDto {
  @ApiProperty({ example: 'MRN123456', required: false })
  @IsOptional()
  @IsString()
  medicalRecordNumber?: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: '1980-05-15' })
  @IsDateString()
  dateOfBirth: string;

  @ApiProperty({ example: 'Male' })
  @IsString()
  gender: string;
  
  @ApiProperty({ example: 'he/him', required: false })
  @IsOptional()
  @IsString()
  pronouns?: string;
  
  @ApiProperty({ example: '123-45-6789', required: false })
  @IsOptional()
  @IsString()
  ssn?: string;
  
  @ApiProperty({ example: 'patient@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;
  
  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  emailVerified?: boolean;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  @IsDateString()
  admissionDate: string;

  @ApiProperty({ example: '2024-01-20T10:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  dischargeDate?: string;

  @ApiProperty({ enum: Priority, example: Priority.MEDIUM })
  @IsEnum(Priority)
  acuityLevel: Priority;

  @ApiProperty({ example: 'Pneumonia', required: false })
  @IsOptional()
  @IsString()
  primaryDiagnosis?: string;

  @ApiProperty({ example: ['Diabetes', 'Hypertension'], required: false })
  @IsOptional()
  @IsArray()
  secondaryDiagnoses?: string[];

  @ApiProperty({ example: ['Penicillin', 'Latex'], required: false })
  @IsOptional()
  @IsArray()
  allergies?: string[];
  
  @ApiProperty({
    example: [{
      substance: 'Penicillin',
      reaction: 'Hives',
      severity: 'Severe',
      dateIdentified: '2020-01-15',
    }],
    required: false,
  })
  @IsOptional()
  @IsArray()
  detailedAllergies?: {
    substance: string;
    reaction: string;
    severity: string;
    dateIdentified: Date;
  }[];
  
  @ApiProperty({
    example: [{
      name: 'Influenza',
      date: '2022-10-15',
      administeredBy: 'Dr. Smith',
      lotNumber: 'ABC123',
      expirationDate: '2023-10-15',
    }],
    required: false,
  })
  @IsOptional()
  @IsArray()
  immunizations?: {
    name: string;
    date: Date;
    administeredBy: string;
    lotNumber?: string;
    expirationDate?: Date;
  }[];
  
  @ApiProperty({
    example: [{
      condition: 'Diabetes',
      relationship: 'Father',
      notes: 'Diagnosed at age 45',
    }],
    required: false,
  })
  @IsOptional()
  @IsArray()
  familyMedicalHistory?: {
    condition: string;
    relationship: string;
    notes: string;
  }[];
  
  @ApiProperty({
    example: {
      smokingStatus: 'Never',
      alcoholUse: 'Occasional',
      substanceUse: 'None',
      notes: 'No history of substance abuse',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  socialHistory?: {
    smokingStatus: string;
    alcoholUse: string;
    substanceUse: string;
    notes: string;
  };

  @ApiProperty({ example: '101A' })
  @IsString()
  roomNumber: string;

  @ApiProperty({ example: '1' })
  @IsString()
  bedNumber: string;

  @ApiProperty({ example: 'Dr. Smith', required: false })
  @IsOptional()
  @IsString()
  attendingPhysician?: string;

  @ApiProperty({ example: 'nurse-uuid', required: false })
  @IsOptional()
  @IsString()
  primaryNurse?: string;
  
  @ApiProperty({
    example: [{
      providerId: 'provider-uuid',
      providerName: 'Dr. Johnson',
      role: 'Cardiologist',
      specialty: 'Cardiology',
      assignmentDate: '2023-01-15',
    }],
    required: false,
  })
  @IsOptional()
  @IsArray()
  careTeam?: {
    providerId: string;
    providerName: string;
    role: string;
    specialty: string;
    assignmentDate: Date;
  }[];
  
  @ApiProperty({
    example: [{
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BCBS123456789',
      groupNumber: 'GRP987654',
      holderName: 'John Doe',
      relationship: 'Self',
      coverageStartDate: '2023-01-01',
      coverageEndDate: '2023-12-31',
      isPrimary: true,
    }],
    required: false,
  })
  @IsOptional()
  @IsArray()
  insuranceInformation?: {
    provider: string;
    policyNumber: string;
    groupNumber: string;
    holderName: string;
    relationship: string;
    coverageStartDate: Date;
    coverageEndDate?: Date;
    isPrimary: boolean;
  }[];
  
  @ApiProperty({ example: 'Do not resuscitate', required: false })
  @IsOptional()
  @IsString()
  advanceDirectives?: string;
  
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  consentToTreat?: boolean;
  
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  consentToShareData?: boolean;
  
  @ApiProperty({ example: 'Local Pharmacy', required: false })
  @IsOptional()
  @IsString()
  preferredPharmacy?: string;
  
  @ApiProperty({ example: 'Website', required: false })
  @IsOptional()
  @IsString()
  referralSource?: string;
  
  @ApiProperty({ example: 'Patient prefers morning appointments', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    example: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'USA',
      addressType: 'Home',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    addressType: string;
  };
  
  @ApiProperty({
    example: [{
      street: '456 College Ave',
      city: 'Collegetown',
      state: 'CA',
      zipCode: '54321',
      country: 'USA',
      addressType: 'Previous',
      startDate: '2018-01-01',
      endDate: '2022-01-01',
    }],
    required: false,
  })
  @IsOptional()
  @IsArray()
  previousAddresses?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    addressType: string;
    startDate: Date;
    endDate: Date;
  }[];

  @ApiProperty({
    example: [{
      name: 'Jane Doe',
      relationship: 'Spouse',
      phoneNumber: '+1987654321',
      email: 'jane@example.com',
      address: '123 Main St, Anytown, CA',
      isPrimary: true,
    }],
    required: false,
  })
  @IsOptional()
  @IsArray()
  emergencyContacts?: {
    name: string;
    relationship: string;
    phoneNumber: string;
    email?: string;
    address?: string;
    isPrimary: boolean;
  }[];
  
  @ApiProperty({ enum: MaritalStatus, example: MaritalStatus.SINGLE, required: false })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus;
  
  @ApiProperty({ example: 'Software Engineer', required: false })
  @IsOptional()
  @IsString()
  occupation?: string;
  
  @ApiProperty({ example: 'Tech Company Inc.', required: false })
  @IsOptional()
  @IsString()
  employer?: string;
  
  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  employerPhone?: string;
  
  @ApiProperty({ enum: LanguagePreference, example: LanguagePreference.ENGLISH, required: false })
  @IsOptional()
  @IsEnum(LanguagePreference)
  preferredLanguage?: LanguagePreference;
  
  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  needsInterpreter?: boolean;
  
  @ApiProperty({ example: 'Hispanic/Latino', required: false })
  @IsOptional()
  @IsString()
  ethnicity?: string;
  
  @ApiProperty({ example: 'White', required: false })
  @IsOptional()
  @IsString()
  race?: string;
  
  @ApiProperty({ enum: BloodType, example: BloodType.A_POSITIVE, required: false })
  @IsOptional()
  @IsEnum(BloodType)
  bloodType?: BloodType;
  
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  organDonor?: boolean;
  
  @ApiProperty({ example: 175, required: false, description: 'Height in centimeters' })
  @IsOptional()
  @IsNumber()
  height?: number;
  
  @ApiProperty({ example: 70, required: false, description: 'Weight in kilograms' })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({
    example: [
      {
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Daily',
        route: 'Oral',
        prescribedBy: 'Dr. Smith',
      },
    ],
    required: false,
  })
  @IsOptional()
  @IsArray()
  currentMedications?: {
    name: string;
    dosage: string;
    frequency: string;
    route: string;
    prescribedBy: string;
  }[];
}
