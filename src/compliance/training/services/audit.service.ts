import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog, AuditEventType, AuditSeverity } from '../entities/audit-log.entity';

interface AuditLogData {
  eventType: string;
  severity: string;
  resourceType: string;
  resourceId: string;
  regulationId?: number;
  description: string;
  userId: number;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(data: AuditLogData): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      userId: data.userId,
      eventType: data.eventType as AuditEventType,
      severity: data.severity as AuditSeverity,
      resourceType: data.resourceType,
      resourceId: data.resourceId,
      regulationId: data.regulationId,
      description: data.description,
      ipAddress: data.ipAddress || 'unknown',
      userAgent: data.userAgent,
      metadata: data.metadata,
      timestamp: new Date(),
    });

    const savedLog = await this.auditLogRepository.save(auditLog);

    this.logger.debug(
      `Audit log created: ${data.eventType} on ${data.resourceType}:${data.resourceId} by user ${data.userId}`,
    );

    return savedLog;
  }
}
