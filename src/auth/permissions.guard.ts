import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Permission } from 'src/common/enums/permissions.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<Permission[]>('permissions', context.getHandler());
    if (!requiredPermissions) return true;

    const { user } = context.switchToHttp().getRequest();
    return user.permissions?.some((p: string) => requiredPermissions.includes(p));
  }
}
