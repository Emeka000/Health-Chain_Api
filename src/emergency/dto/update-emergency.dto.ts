import { PartialType } from '@nestjs/swagger';
import { CreateEmergencyDto } from './create-emergency.dto';

export class UpdateEmergencyDto extends PartialType(CreateEmergencyDto) {}
