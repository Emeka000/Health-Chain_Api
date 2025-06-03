import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>(
      'permission',
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const hasPermission = user.role.permissions.some(
      (perm) => `${perm.action}_${perm.resource}` === requiredPermission,
    );

    if (!hasPermission) throw new ForbiddenException('Access denied');

    return true;
  }
}
