import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HipaaComplianceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Add HIPAA-required security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains',
    );
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'");

    // Add medical-specific headers
    res.setHeader('X-PHI-Protected', 'true');
    res.setHeader('X-HIPAA-Compliant', 'true');
    res.setHeader('X-Medical-API-Version', '1.0');

    // Log all PHI-related requests for audit
    if (this.isPhiEndpoint(req.path)) {
      console.log(
        `PHI Access Log: ${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`,
      );
    }

    next();
  }

  private isPhiEndpoint(path: string): boolean {
    const phiEndpoints = [
      '/patients',
      '/appointments',
      '/observations',
      '/medical-records',
    ];
    return phiEndpoints.some((endpoint) => path.startsWith(endpoint));
  }
}
