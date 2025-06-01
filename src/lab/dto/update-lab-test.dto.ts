import { PartialType } from '@nestjs/mapped-types';
import { DeepPartial } from 'typeorm';
import { LabTest } from '../entities/lab-test.entity';

export class UpdateLabTestDto extends PartialType(LabTest) {
  parameters?: DeepPartial<Record<string, any>>;
}