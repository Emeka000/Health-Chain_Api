import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

interface AuditLogData {
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  patientId?: string;
  ipAddress: string;
  userAgent?: string;
  details?: string;
  successful: boolean;
  reason?: string;
  sessionId?: string;
  deviceId?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private auditRepository: Repository<AuditLog>,
  ) {}

  async logAccess(data: AuditLogData): Promise<void> {
    const auditLog = this.auditRepository.create(data);
    await this.auditRepository.save(auditLog);

    // Check for suspicious patterns
    await this.detectSuspiciousActivity(data);
  }

  async getAuditTrail(
    patientId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AuditLog[]> {
    const query = this.auditRepository
      .createQueryBuilder('audit')
      .where('audit.patientId = :patientId', { patientId })
      .orderBy('audit.timestamp', 'DESC');

    if (startDate) {
      query.andWhere('audit.timestamp >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('audit.timestamp <= :endDate', { endDate });
    }

    return query.getMany();
  }

  async getUserActivity(
    userId: string,
    hours: number = 24,
  ): Promise<AuditLog[]> {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    return this.auditRepository.find({
      where: {
        userId,
        timestamp: { $gte: since } as any,
      },
      order: { timestamp: 'DESC' },
    });
  }

  private async detectSuspiciousActivity(data: AuditLogData): Promise<void> {
    // Check for multiple failed attempts
    const recentFailures = await this.auditRepository.count({
      where: {
        userId: data.userId,
        successful: false,
        timestamp: { $gte: new Date(Date.now() - 15 * 60 * 1000) } as any, // Last 15 minutes
      },
    });

    if (recentFailures >= 5) {
      // Trigger security incident
      // This would integrate with your SecurityIncidentService
      console.warn(
        `Suspicious activity detected for user ${data.userId}: ${recentFailures} failed attempts`,
      );
    }

    // Check for unusual access patterns
    if (data.successful && data.patientId) {
      const recentAccess = await this.auditRepository.count({
        where: {
          userId: data.userId,
          patientId: data.patientId,
          timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } as any, // Last hour
        },
      });

      if (recentAccess > 10) {
        console.warn(
          `Unusual access pattern detected: User ${data.userId} accessed patient ${data.patientId} ${recentAccess} times in the last hour`,
        );
      }
    }
  }
}
