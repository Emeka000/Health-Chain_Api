import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Authentication token required for PHI access');
    }

    try {
      const payload = this.jwtService.verify(token);
      request.user = payload;
      
      // Log PHI access attempt (implement audit logging)
      this.logPhiAccess(payload, request);
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid authentication token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private logPhiAccess(user: any, request: any) {
    // Implement comprehensive audit logging for HIPAA compliance
    console.log(`PHI Access: User ${user.sub} accessed ${request.url} at ${new Date().toISOString()}`);
  }
}
