import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SecurityIncident, IncidentSeverity, IncidentStatus } from '../entities/security-incident.entity';
import { BreachNotificationService } from './breach-notification.service';

interface CreateIncidentData {
  title: string;
  description: string;
  severity: IncidentSeverity;
  category: string;
  affectedUserId?: string;
  affectedPatientId?: string;
  sourceIpAddress?: string;
  technicalDetails?: string;
  breachOccurred?: boolean;
}

@Injectable()
export class SecurityIncidentService {
  constructor(
    @InjectRepository(SecurityIncident)
    private incidentRepository: Repository<SecurityIncident>,
    private breachNotificationService: BreachNotificationService,
  ) {}

  async createIncident(data: CreateIncidentData): Promise<SecurityIncident> {
    const incident = this.incidentRepository.create({
      ...data,
      status: IncidentStatus.OPEN,
    });

    if (data.breachOccurred) {
      // HIPAA requires breach notification within 60 days
      incident.breachNotificationDeadline = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
    }

    const savedIncident = await this.incidentRepository.save(incident);

    // Auto-escalate critical incidents
    if (data.severity === IncidentSeverity.CRITICAL) {
      await this.escalateIncident(savedIncident.id);
    }

    // Handle breach notification if required
    if (data.breachOccurred) {
      await this.breachNotificationService.initiateBreachNotification(savedIncident);
    }

    return savedIncident;
  }

  async updateIncidentStatus(incidentId: string, status: IncidentStatus, notes?: string): Promise<void> {
    await this.incidentRepository.update(incidentId, {
      status,
      resolutionNotes: notes,
      updatedAt: new Date(),
    });
  }

  async getOpenIncidents(): Promise<SecurityIncident[]> {
    return this.incidentRepository.find({
      where: {
        status: IncidentStatus.OPEN,
      },
      order: { severity: 'DESC', createdAt: 'ASC' },
    });
  }

  async getCriticalIncidents(): Promise<SecurityIncident[]> {
    return this.incidentRepository.find({
      where: {
        severity: IncidentSeverity.CRITICAL,
        status: IncidentStatus.OPEN,
      },
      order: { createdAt: 'ASC' },
    });
  }

  private async escalateIncident(incidentId: string): Promise<void> {
    // Auto-assign to security team
    await this.incidentRepository.update(incidentId, {
      status: IncidentStatus.INVESTIGATING,
      assignedTo: 'security-team', // This would be a real user ID
    });

    // Send immediate alerts (integrate with your notification system)
    console.error(`CRITICAL SECURITY INCIDENT: ${incidentId} - Immediate attention required`);
  }
}