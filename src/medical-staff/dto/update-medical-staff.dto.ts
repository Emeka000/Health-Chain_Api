import { PartialType } from '@nestjs/swagger';
import { CreateMedicalStaffDto } from './create-medical-staff.dto';

export class UpdateMedicalStaffDto extends PartialType(CreateMedicalStaffDto) {}
