import {
  IsString,
  IsArray,
  IsDateString,
  IsOptional,
  IsObject,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateShiftHandoffDto {
  @ApiProperty({ example: 'from-shift-uuid' })
  @IsString()
  fromShiftId: string;

  @ApiProperty({ example: 'to-shift-uuid' })
  @IsString()
  toShiftId: string;

  @ApiProperty({ example: 'from-nurse-uuid' })
  @IsString()
  fromNurseId: string;

  @ApiProperty({ example: 'to-nurse-uuid' })
  @IsString()
  toNurseId: string;

  @ApiProperty({ example: 'Patient care updates and important notes' })
  @IsString()
  handoffNotes: string;

  @ApiProperty({
    example: [
      {
        patientId: 'patient-uuid',
        condition: 'stable',
        medications: ['medication1', 'medication2'],
        specialInstructions: 'Monitor vitals every 2 hours',
        priority: 'medium',
      },
    ],
  })
  @IsArray()
  patientUpdates: {
    patientId: string;
    condition: string;
    medications: string[];
    specialInstructions: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }[];

  @ApiProperty({ example: '2024-01-15T19:00:00Z' })
  @IsDateString()
  handoffTime: string;

  @ApiProperty({
    example: {
      censusCount: 25,
      criticalPatients: 3,
      pendingDischarges: 2,
      pendingAdmissions: 1,
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  departmentStatus?: {
    censusCount: number;
    criticalPatients: number;
    pendingDischarges: number;
    pendingAdmissions: number;
    equipmentIssues?: string[];
    staffingConcerns?: string[];
  };
}
