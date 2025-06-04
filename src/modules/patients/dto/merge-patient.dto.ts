import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ConflictResolutionDto {
  @ApiProperty({ example: 'firstName' })
  @IsString()
  field: string;

  @ApiProperty({ example: 'sourcePatient' })
  @IsString()
  resolution: string; // 'sourcePatient', 'targetPatient', or 'manual'

  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  manualValue?: string;
}

export class MergePatientDto {
  @ApiProperty({ example: 'source-patient-uuid' })
  @IsString()
  sourcePatientId: string;

  @ApiProperty({ example: 'target-patient-uuid' })
  @IsString()
  targetPatientId: string;

  @ApiProperty({ 
    example: [
      { field: 'firstName', resolution: 'sourcePatient' },
      { field: 'lastName', resolution: 'targetPatient' },
      { field: 'phoneNumber', resolution: 'manual', manualValue: '+1987654321' }
    ],
    required: false,
    type: [ConflictResolutionDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConflictResolutionDto)
  conflictResolutions?: ConflictResolutionDto[];

  @ApiProperty({ example: 'Duplicate patient records merged by Dr. Smith', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
