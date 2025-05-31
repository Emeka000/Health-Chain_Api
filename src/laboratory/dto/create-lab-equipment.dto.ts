// dto/create-lab-equipment.dto.ts
export class CreateLabEquipmentDto {
  name: string;
  model: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastServicedDate?: Date;
}

// dto/update-lab-equipment.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateLabEquipmentDto } from './create-lab-equipment.dto';

export class UpdateLabEquipmentDto extends PartialType(CreateLabEquipmentDto) {}
