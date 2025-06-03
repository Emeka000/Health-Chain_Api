import { PartialType } from '@nestjs/mapped-types';
import { CreateDrugDto } from './create-drug.dto';

export class UpdateDrugDto extends PartialType(CreateDrugDto) {}
