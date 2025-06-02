import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { EmergencyAlert } from './entities/emergency-alert.entity';
import { EmergencyDocumentation } from './entities/emergency-documentation.entity';
import { EmergencyResource } from './entities/emergency-resources.entity';
import {
  Emergency,
  TriageLevel,
  ResourceType,
  EmergencyStatus,
} from './entities/emergency.entity';

@Injectable()
export class EmergencyService {
  constructor(
    @InjectRepository(Emergency)
    private emergencyRepository: Repository<Emergency>,
    @InjectRepository(EmergencyAlert)
    private alertRepository: Repository<EmergencyAlert>,
    @InjectRepository(EmergencyResource)
    private resourceRepository: Repository<EmergencyResource>,
    @InjectRepository(EmergencyDocumentation)
    private documentationRepository: Repository<EmergencyDocumentation>,
  ) {}

  async createEmergency(
    createEmergencyDto: CreateEmergencyDto,
  ): Promise<Emergency> {
    const emergency = this.emergencyRepository.create(createEmergencyDto);

    // Auto-assign triage level based on symptoms and vital signs
    emergency.triageLevel = await this.calculateTriageLevel(createEmergencyDto);
    emergency.triageTime = new Date();

    const savedEmergency = await this.emergencyRepository.save(emergency);

    // Check for automatic escalation
    if (emergency.triageLevel <= TriageLevel.EMERGENT) {
      await this.escalateEmergency(
        savedEmergency.id,
        'Critical triage level detected',
      );
    }

    return savedEmergency;
  }

  private async calculateTriageLevel(
    dto: CreateEmergencyDto,
  ): Promise<TriageLevel> {
    const criticalSymptoms = [
      'chest pain',
      'difficulty breathing',
      'unconscious',
      'severe bleeding',
      'stroke symptoms',
      'cardiac arrest',
      'major trauma',
    ];

    const urgentSymptoms = [
      'severe pain',
      'high fever',
      'vomiting blood',
      'severe headache',
      'broken bone',
      'allergic reaction',
    ];

    const symptoms = dto.symptoms.toLowerCase();
    const complaint = dto.chiefComplaint.toLowerCase();

    // Check vital signs for critical values
    if (dto.vitalSigns) {
      const { heartRate, temperature, oxygenSaturation } = dto.vitalSigns;

      if (heartRate && (heartRate < 50 || heartRate > 120)) {
        return TriageLevel.EMERGENT;
      }

      if (temperature && temperature > 39.5) {
        return TriageLevel.EMERGENT;
      }

      if (oxygenSaturation && oxygenSaturation < 90) {
        return TriageLevel.RESUSCITATION;
      }
    }

    // Check symptoms
    if (
      criticalSymptoms.some(
        (symptom) => symptoms.includes(symptom) || complaint.includes(symptom),
      )
    ) {
      return TriageLevel.RESUSCITATION;
    }

    if (
      urgentSymptoms.some(
        (symptom) => symptoms.includes(symptom) || complaint.includes(symptom),
      )
    ) {
      return TriageLevel.URGENT;
    }

    // Age-based adjustments
    if (dto.age < 2 || dto.age > 75) {
      return TriageLevel.URGENT;
    }

    return TriageLevel.LESS_URGENT;
  }

  async escalateEmergency(emergencyId: string, reason: string): Promise<void> {
    const emergency = await this.emergencyRepository.findOne({
      where: { id: emergencyId },
    });

    if (!emergency) {
      throw new NotFoundException('Emergency not found');
    }

    emergency.isEscalated = true;
    emergency.escalationReason = reason;
    await this.emergencyRepository.save(emergency);

    // Create alert
    await this.createAlert(
      emergencyId,
      'escalation',
      `Emergency escalated: ${reason}`,
      'high',
    );

    // Auto-assign senior staff if available
    await this.assignSeniorStaff(emergencyId);
  }

  async createAlert(
    emergencyId: string,
    alertType: string,
    message: string,
    severity: string,
  ): Promise<EmergencyAlert> {
    const alert = this.alertRepository.create({
      emergencyId,
      alertType,
      message,
      severity,
    });

    return await this.alertRepository.save(alert);
  }

  async allocateResource(
    emergencyId: string,
    resourceType: ResourceType,
    resourceId: string,
    resourceName: string,
  ): Promise<EmergencyResource> {
    const resource = this.resourceRepository.create({
      emergencyId,
      resourceType,
      resourceId,
      resourceName,
      allocatedAt: new Date(),
    });

    return await this.resourceRepository.save(resource);
  }

  async releaseResource(resourceAllocationId: string): Promise<void> {
    const resource = await this.resourceRepository.findOne({
      where: { id: resourceAllocationId },
    });

    if (!resource) {
      throw new NotFoundException('Resource allocation not found');
    }

    resource.releasedAt = new Date();
    resource.isActive = false;
    await this.resourceRepository.save(resource);
  }

  async addDocumentation(
    emergencyId: string,
    documentType: string,
    content: string,
    authorId: string,
    authorName: string,
    authorRole: string,
  ): Promise<EmergencyDocumentation> {
    const doc = this.documentationRepository.create({
      emergencyId,
      documentType,
      content,
      authorId,
      authorName,
      authorRole,
    });

    return await this.documentationRepository.save(doc);
  }

  async getEmergencyQueue(): Promise<Emergency[]> {
    return await this.emergencyRepository.find({
      where: { status: EmergencyStatus.PENDING },
      order: {
        triageLevel: 'ASC',
        createdAt: 'ASC',
      },
      relations: ['alerts', 'resources'],
    });
  }

  async updateEmergencyStatus(
    emergencyId: string,
    status: EmergencyStatus,
  ): Promise<Emergency> {
    const emergency = await this.emergencyRepository.findOne({
      where: { id: emergencyId },
    });

    if (!emergency) {
      throw new NotFoundException('Emergency not found');
    }

    emergency.status = status;

    if (
      status === EmergencyStatus.IN_PROGRESS &&
      !emergency.treatmentStartTime
    ) {
      emergency.treatmentStartTime = new Date();
      emergency.waitTimeMinutes = Math.floor(
        (emergency.treatmentStartTime.getTime() -
          emergency.createdAt.getTime()) /
          (1000 * 60),
      );
    }

    if (
      [
        EmergencyStatus.DISCHARGED,
        EmergencyStatus.ADMITTED,
        EmergencyStatus.TRANSFERRED,
      ].includes(status)
    ) {
      emergency.dischargeTime = new Date();

      // Release all allocated resources
      await this.resourceRepository.update(
        { emergencyId, isActive: true },
        { releasedAt: new Date(), isActive: false },
      );
    }

    return await this.emergencyRepository.save(emergency);
  }

  async getQualityMetrics(startDate: Date, endDate: Date): Promise<any> {
    const emergencies = await this.emergencyRepository.find({
      where: {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        } as any,
      },
    });

    const totalCases = emergencies.length;
    const avgWaitTime =
      emergencies.reduce((sum, e) => sum + e.waitTimeMinutes, 0) / totalCases;

    const triageDistribution = emergencies.reduce((acc, e) => {
      acc[e.triageLevel] = (acc[e.triageLevel] || 0) + 1;
      return acc;
    }, {});

    const escalationRate =
      (emergencies.filter((e) => e.isEscalated).length / totalCases) * 100;

    return {
      totalCases,
      avgWaitTime: Math.round(avgWaitTime),
      triageDistribution,
      escalationRate: Math.round(escalationRate * 100) / 100,
      complianceMetrics: {
        level1ResponseTime: this.calculateResponseTimeCompliance(
          emergencies,
          TriageLevel.RESUSCITATION,
          0,
        ),
        level2ResponseTime: this.calculateResponseTimeCompliance(
          emergencies,
          TriageLevel.EMERGENT,
          15,
        ),
        level3ResponseTime: this.calculateResponseTimeCompliance(
          emergencies,
          TriageLevel.URGENT,
          30,
        ),
      },
    };
  }

  private calculateResponseTimeCompliance(
    emergencies: Emergency[],
    level: TriageLevel,
    targetMinutes: number,
  ): number {
    const levelCases = emergencies.filter((e) => e.triageLevel === level);
    if (levelCases.length === 0) return 100;

    const compliantCases = levelCases.filter(
      (e) => e.waitTimeMinutes <= targetMinutes,
    );
    return Math.round((compliantCases.length / levelCases.length) * 100);
  }

  private async assignSeniorStaff(emergencyId: string): Promise<void> {
    // This would integrate with your staff management system
    // For now, we'll just create an alert for staff assignment
    await this.createAlert(
      emergencyId,
      'staff_assignment',
      'Senior staff assignment required for escalated case',
      'high',
    );
  }
}
