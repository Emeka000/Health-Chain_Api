import { PartialType } from '@nestjs/mapped-types';
import { IsUUID, IsOptional } from 'class-validator';
import { CreatePatientMedicationAllergyDto } from './create-patient-medication-allergy.dto';

export class UpdatePatientMedicationAllergyDto extends PartialType(CreatePatientMedicationAllergyDto) {
  @IsOptional()
  @IsUUID()
  updatedBy: string;
}
