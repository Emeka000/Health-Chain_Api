import { PartialType } from '@nestjs/mapped-types';
import { CreateMedicationAdministrationDto } from './create-medication-administration.dto';

export class UpdateMedicationAdministrationDto extends PartialType(CreateMedicationAdministrationDto) {}
