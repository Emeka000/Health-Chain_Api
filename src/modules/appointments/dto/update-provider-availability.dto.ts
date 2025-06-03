import { PartialType } from '@nestjs/swagger';
import { CreateProviderAvailabilityDto } from './create-provider-availability.dto';

export class UpdateProviderAvailabilityDto extends PartialType(
  CreateProviderAvailabilityDto,
) {}
