import { PartialType } from '@nestjs/mapped-types';
import { CreateLabTestDto } from './create-lab-test.dto';

export class UpdateLabTestDto extends PartialType(CreateLabTestDto) {}