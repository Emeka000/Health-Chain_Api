import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { MedicalAuditService } from './audit-logger.service';

export class MedicalValidationException extends HttpException {
  constructor(
    public readonly validationErrors: string[],
    public readonly patientId?: string,
    public readonly medicalRecordNumber?: string,
  ) {
    super('Medical data validation failed', HttpStatus.BAD_REQUEST);
  }
}

export class MedicalEmergencyException extends HttpException {
  constructor(
    public readonly emergencyLevel: string,
    public readonly patientId: string,
    public readonly details: string,
  ) {
    super('Medical emergency detected', HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

@Catch()
export class MedicalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MedicalExceptionFilter.name);

  constructor(private readonly auditService: MedicalAuditService) {}

  async catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An error occurred while processing medical data';
    let errorCode = 'MEDICAL_ERROR';

    if (exception instanceof MedicalValidationException) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Medical data validation failed';
      errorCode = 'VALIDATION_ERROR';

      // Log validation failure for compliance
      await this.auditService.logMedicalEvent({
        eventType: 'VALIDATION_FAILURE',
        userId: (request.headers['user-id'] as string) || 'anonymous',
        patientId: exception.patientId,
        details: `Validation errors: ${exception.validationErrors.join(', ')}`,
        ipAddress: request.ip,
        userAgent: request.get('User-Agent'),
        severity: 'WARN',
      });
    } else if (exception instanceof MedicalEmergencyException) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Medical emergency processing required';
      errorCode = 'EMERGENCY_ERROR';

      // Log emergency for immediate attention
      await this.auditService.logMedicalEvent({
        eventType: 'EMERGENCY_ALERT',
        userId: (request.headers['user-id'] as string) || 'system',
        patientId: exception.patientId,
        details: `Emergency Level: ${exception.emergencyLevel} - ${exception.details}`,
        ipAddress: request.ip,
        userAgent: request.get('User-Agent'),
        severity: 'CRITICAL',
      });
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      message =
        typeof response === 'string'
          ? response
          : (response as any).message || message;
    }

    // HIPAA-compliant error response (no patient information exposed)
    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      errorCode,
      message,
      // Never include sensitive data in error responses
      requestId: this.generateRequestId(),
    };

    this.logger.error(`Medical data error: ${JSON.stringify(errorResponse)}`);
    response.status(status).json(errorResponse);
  }

  private generateRequestId(): string {
    return `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
