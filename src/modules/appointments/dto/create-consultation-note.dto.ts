import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsUUID,
  IsString,
  IsOptional,
  Length,
  IsDateString,
  IsBoolean,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

class VitalSignsDto {
  @ApiPropertyOptional({ description: 'Temperature in Celsius', example: 37.2 })
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional({ description: 'Heart rate in BPM', example: 72 })
  @IsOptional()
  heartRate?: number;

  @ApiPropertyOptional({
    description: 'Systolic blood pressure in mmHg',
    example: 120,
  })
  @IsOptional()
  bloodPressureSystolic?: number;

  @ApiPropertyOptional({
    description: 'Diastolic blood pressure in mmHg',
    example: 80,
  })
  @IsOptional()
  bloodPressureDiastolic?: number;

  @ApiPropertyOptional({
    description: 'Respiratory rate in breaths per minute',
    example: 16,
  })
  @IsOptional()
  respiratoryRate?: number;

  @ApiPropertyOptional({
    description: 'Oxygen saturation percentage',
    example: 98,
  })
  @IsOptional()
  oxygenSaturation?: number;

  @ApiPropertyOptional({ description: 'Weight in kg', example: 70.5 })
  @IsOptional()
  weight?: number;

  @ApiPropertyOptional({ description: 'Height in cm', example: 175 })
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({ description: 'Body Mass Index', example: 23.0 })
  @IsOptional()
  bmi?: number;

  @ApiPropertyOptional({ description: 'Pain level (0-10)', example: 2 })
  @IsOptional()
  pain?: number;
}

class DiagnosisDto {
  @ApiProperty({ description: 'Diagnosis code (ICD-10)', example: 'J45.909' })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Diagnosis description',
    example: 'Unspecified asthma, uncomplicated',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'Diagnosis type', example: 'Primary' })
  @IsOptional()
  @IsString()
  type?: string;
}

class MedicationDto {
  @ApiProperty({ description: 'Medication name', example: 'Albuterol Sulfate' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Medication dosage', example: '90mcg' })
  @IsString()
  dosage: string;

  @ApiProperty({
    description: 'Medication frequency',
    example: 'Every 4-6 hours as needed',
  })
  @IsString()
  frequency: string;

  @ApiProperty({ description: 'Medication route', example: 'Inhalation' })
  @IsString()
  route: string;

  @ApiPropertyOptional({
    description: 'Medication duration',
    example: '30 days',
  })
  @IsOptional()
  @IsString()
  duration?: string;

  @ApiPropertyOptional({
    description: 'Medication instructions',
    example: 'Use as needed for shortness of breath',
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}

class LabTestDto {
  @ApiProperty({
    description: 'Lab test name',
    example: 'Complete Blood Count',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Reason for test',
    example: 'Rule out infection',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({ description: 'Test urgency', example: 'Routine' })
  @IsOptional()
  @IsString()
  urgency?: string;

  @ApiPropertyOptional({
    description: 'Special instructions',
    example: 'Fasting required',
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}

class ProcedureDto {
  @ApiProperty({
    description: 'Procedure name',
    example: 'Pulmonary Function Test',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Reason for procedure',
    example: 'Evaluate lung function',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Special instructions',
    example: 'No bronchodilators 6 hours prior',
  })
  @IsOptional()
  @IsString()
  instructions?: string;
}

class ReferralDto {
  @ApiProperty({ description: 'Specialty to refer to', example: 'Pulmonology' })
  @IsString()
  specialty: string;

  @ApiPropertyOptional({
    description: 'Reason for referral',
    example: 'Persistent asthma symptoms',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Referral urgency',
    example: 'Within 2 weeks',
  })
  @IsOptional()
  @IsString()
  urgency?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Patient has family history of COPD',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateConsultationNoteDto {
  @ApiProperty({
    description: 'Appointment UUID reference',
    example: '550e8400-e29b-41d4-a716-446655440002',
    type: String,
    format: 'uuid',
    required: true,
  })
  @IsUUID()
  appointmentId: string;

  @ApiProperty({
    description: 'Healthcare provider UUID reference',
    example: '550e8400-e29b-41d4-a716-446655440001',
    type: String,
    format: 'uuid',
    required: true,
  })
  @IsUUID()
  providerId: string;

  @ApiProperty({
    description: 'Clinical notes',
    example:
      'Patient presents with wheezing and shortness of breath for the past 3 days.',
    type: String,
    required: true,
  })
  @IsString()
  @Length(1, 5000)
  notes: string;

  @ApiPropertyOptional({
    description: 'Vital signs recorded during the visit',
    type: VitalSignsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => VitalSignsDto)
  vitalSigns?: VitalSignsDto;

  @ApiPropertyOptional({
    description: 'Subjective information (patient history, complaints)',
    example:
      'Patient reports increased use of rescue inhaler over the past week.',
  })
  @IsOptional()
  @IsString()
  subjective?: string;

  @ApiPropertyOptional({
    description: 'Objective findings from examination',
    example: 'Lungs: Wheezing in all fields. O2 sat 95% on room air.',
  })
  @IsOptional()
  @IsString()
  objective?: string;

  @ApiPropertyOptional({
    description: "Assessment of the patient's condition",
    example: 'Acute asthma exacerbation, moderate severity.',
  })
  @IsOptional()
  @IsString()
  assessment?: string;

  @ApiPropertyOptional({
    description: 'Treatment plan',
    example:
      'Start prednisone 40mg daily for 5 days. Increase albuterol to every 4 hours as needed.',
  })
  @IsOptional()
  @IsString()
  plan?: string;

  @ApiPropertyOptional({
    description: 'Diagnoses made during the visit',
    type: [DiagnosisDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DiagnosisDto)
  diagnoses?: DiagnosisDto[];

  @ApiPropertyOptional({
    description: 'Medications prescribed',
    type: [MedicationDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MedicationDto)
  medications?: MedicationDto[];

  @ApiPropertyOptional({
    description: 'Lab tests ordered',
    type: [LabTestDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LabTestDto)
  labTests?: LabTestDto[];

  @ApiPropertyOptional({
    description: 'Procedures ordered',
    type: [ProcedureDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcedureDto)
  procedures?: ProcedureDto[];

  @ApiPropertyOptional({
    description: 'Referrals to specialists',
    type: [ReferralDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReferralDto)
  referrals?: ReferralDto[];

  @ApiPropertyOptional({
    description: 'Patient education provided',
    example:
      'Reviewed proper inhaler technique. Discussed asthma triggers and avoidance strategies.',
  })
  @IsOptional()
  @IsString()
  patientEducation?: string;

  @ApiPropertyOptional({
    description: 'Follow-up instructions',
    example: 'Return in 2 weeks for reassessment. Sooner if symptoms worsen.',
  })
  @IsOptional()
  @IsString()
  followUpInstructions?: string;

  @ApiPropertyOptional({
    description: 'Follow-up date if needed',
    example: '2024-07-01T10:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  followUpDate?: string;

  @ApiPropertyOptional({
    description: 'Whether a follow-up appointment has been scheduled',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  followUpScheduled?: boolean;
}
