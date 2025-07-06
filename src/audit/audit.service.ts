import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AuditLog, AuditAction, AuditResult } from './audit-log.entity';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

export interface AuditContext {
  userId?: string;
  username?: string;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  endpoint?: string;
  httpMethod?: string;
}

export interface AuditData {
  action: AuditAction;
  result: AuditResult;
  entityType?: string;
  entityId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  description?: string;
  errorMessage?: string;
  additionalData?: Record<string, any>;
  isPHIAccess?: boolean;
  phiType?: string;
  statusCode?: number;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);
  private readonly fileLogger: winston.Logger;

  constructor(
    @InjectRepository(AuditLog, 'audit')
    private auditLogRepository: Repository<AuditLog>,
    private configService: ConfigService,
  ) {
    this.fileLogger = this.createFileLogger();
  }

  private createFileLogger(): winston.Logger {
    const logDir = './logs/audit';

    return winston.createLogger({
      level: this.configService.get('AUDIT_LOG_LEVEL', 'info'),
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          filename: `${logDir}/audit-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          maxSize: this.configService.get('AUDIT_LOG_MAX_SIZE', '20m'),
          maxFiles: this.configService.get('AUDIT_LOG_MAX_FILES', '100'),
          auditFile: `${logDir}/audit-files.json`,
          zippedArchive: true,
        }),
        new winston.transports.DailyRotateFile({
          filename: `${logDir}/audit-error-%DATE%.log`,
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxSize: this.configService.get('AUDIT_LOG_MAX_SIZE', '20m'),
          maxFiles: this.configService.get('AUDIT_LOG_MAX_FILES', '100'),
          zippedArchive: true,
        }),
      ],
    });
  }

  /**
   * Log audit event to both database and file system
   */
  async logAuditEvent(context: AuditContext, data: AuditData): Promise<void> {
    try {
      // Create audit log entry
      const auditLog = this.auditLogRepository.create({
        userId: context.userId,
        username: context.username,
        action: data.action,
        result: data.result,
        entityType: data.entityType,
        entityId: data.entityId,
        oldValues: data.oldValues,
        newValues: data.newValues,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        sessionId: context.sessionId,
        endpoint: context.endpoint,
        httpMethod: context.httpMethod,
        statusCode: data.statusCode,
        description: data.description,
        errorMessage: data.errorMessage,
        additionalData: data.additionalData,
        isPHIAccess: data.isPHIAccess || false,
        phiType: data.phiType,
      });

      // Save to database
      await this.auditLogRepository.save(auditLog);

      // Log to file system
      this.fileLogger.info('Audit Event', {
        auditId: auditLog.id,
        userId: context.userId,
        username: context.username,
        action: data.action,
        result: data.result,
        entityType: data.entityType,
        entityId: data.entityId,
        ipAddress: context.ipAddress,
        endpoint: context.endpoint,
        httpMethod: context.httpMethod,
        isPHIAccess: data.isPHIAccess,
        phiType: data.phiType,
        timestamp: new Date().toISOString(),
      });

      // Special handling for PHI access
      if (data.isPHIAccess) {
        this.logPHIAccess(context, data);
      }
    } catch (error) {
      this.logger.error(
        `Failed to log audit event: ${error.message}`,
        error.stack,
      );
      // Fallback to file logging only
      this.fileLogger.error('Audit Logging Failed', {
        error: error.message,
        context,
        data,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Special logging for PHI access
   */
  private logPHIAccess(context: AuditContext, data: AuditData): void {
    this.fileLogger.warn('PHI Access Event', {
      userId: context.userId,
      username: context.username,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      phiType: data.phiType,
      ipAddress: context.ipAddress,
      endpoint: context.endpoint,
      timestamp: new Date().toISOString(),
      severity: 'HIGH',
    });
  }

  /**
   * Log successful login
   */
  async logLogin(context: AuditContext): Promise<void> {
    await this.logAuditEvent(context, {
      action: AuditAction.LOGIN,
      result: AuditResult.SUCCESS,
      description: 'User logged in successfully',
    });
  }

  /**
   * Log failed login attempt
   */
  async logFailedLogin(context: AuditContext, reason: string): Promise<void> {
    await this.logAuditEvent(context, {
      action: AuditAction.ACCESS_ATTEMPT,
      result: AuditResult.FAILURE,
      description: 'Failed login attempt',
      errorMessage: reason,
      additionalData: { attemptType: 'login' },
    });
  }

  /**
   * Log logout
   */
  async logLogout(context: AuditContext): Promise<void> {
    await this.logAuditEvent(context, {
      action: AuditAction.LOGOUT,
      result: AuditResult.SUCCESS,
      description: 'User logged out',
    });
  }

  /**
   * Log data access
   */
  async logDataAccess(
    context: AuditContext,
    entityType: string,
    entityId: string,
    isPHI: boolean = false,
    phiType?: string,
  ): Promise<void> {
    await this.logAuditEvent(context, {
      action: AuditAction.READ,
      result: AuditResult.SUCCESS,
      entityType,
      entityId,
      description: `Accessed ${entityType} data`,
      isPHIAccess: isPHI,
      phiType,
    });
  }

  /**
   * Log data modification
   */
  async logDataModification(
    context: AuditContext,
    action: AuditAction,
    entityType: string,
    entityId: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    isPHI: boolean = false,
  ): Promise<void> {
    await this.logAuditEvent(context, {
      action,
      result: AuditResult.SUCCESS,
      entityType,
      entityId,
      oldValues,
      newValues,
      description: `${action} operation on ${entityType}`,
      isPHIAccess: isPHI,
    });
  }

  /**
   * Get audit logs with pagination and filtering
   */
  async getAuditLogs(options: {
    page?: number;
    limit?: number;
    userId?: string;
    action?: AuditAction;
    entityType?: string;
    startDate?: Date;
    endDate?: Date;
    isPHIAccess?: boolean;
  }): Promise<{ logs: AuditLog[]; total: number }> {
    const { page = 1, limit = 50, ...filters } = options;

    const queryBuilder = this.auditLogRepository.createQueryBuilder('audit');

    if (filters.userId) {
      queryBuilder.andWhere('audit.userId = :userId', {
        userId: filters.userId,
      });
    }

    if (filters.action) {
      queryBuilder.andWhere('audit.action = :action', {
        action: filters.action,
      });
    }

    if (filters.entityType) {
      queryBuilder.andWhere('audit.entityType = :entityType', {
        entityType: filters.entityType,
      });
    }

    if (filters.startDate) {
      queryBuilder.andWhere('audit.createdAt >= :startDate', {
        startDate: filters.startDate,
      });
    }

    if (filters.endDate) {
      queryBuilder.andWhere('audit.createdAt <= :endDate', {
        endDate: filters.endDate,
      });
    }

    if (filters.isPHIAccess !== undefined) {
      queryBuilder.andWhere('audit.isPHIAccess = :isPHIAccess', {
        isPHIAccess: filters.isPHIAccess,
      });
    }

    queryBuilder
      .orderBy('audit.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [logs, total] = await queryBuilder.getManyAndCount();

    return { logs, total };
  }

  /**
   * Cleanup old audit logs based on retention policy
   */
  async cleanupOldLogs(): Promise<void> {
    const retentionDays = parseInt(
      this.configService.get('AUDIT_LOG_RETENTION_DAYS', '2555'),
      10,
    );
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.auditLogRepository
      .createQueryBuilder()
      .delete()
      .where('createdAt < :cutoffDate', { cutoffDate })
      .execute();

    this.logger.log(`Cleaned up ${result.affected} old audit log entries`);
  }

    async log(userId: string, patientId: string, action: string, ipAddress: string) {
    const log = this.auditRepo.create({ userId, patientId, action, ipAddress });
    return this.auditRepo.save(log);
  }
}
