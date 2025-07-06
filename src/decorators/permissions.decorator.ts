import { SetMetadata } from '@nestjs/common';
import { Permission } from 'src/common/enums/permissions.enum';

export const Permissions = (...permissions: Permission[]) => SetMetadata('permissions', permissions);
