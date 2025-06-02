import { PartialType } from '@nestjs/swagger';
import { CreateMarDto } from './create-mar.dto';

export class UpdateMarDto extends PartialType(CreateMarDto) {}
