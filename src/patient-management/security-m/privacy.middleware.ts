import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class PrivacyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Log access to patient data
    if (req.url.includes('/patients/')) {
      console.log(`Patient data access: ${req.method} ${req.url} by user ${req.user?.id} at ${new Date()}`);
    }

    // Set privacy headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    next();
  }
}
