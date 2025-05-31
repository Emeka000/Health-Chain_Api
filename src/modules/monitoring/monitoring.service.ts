import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemHealth } from './entities/system-health.entity';
import { ClinicalAlert } from './entities/clinical-alert.entity';
import { ComplianceLog } from './entities/compliance-log.entity';
import { IncidentReport } from './entities/incident-report.entity';
import { EquipmentHealth } from './entities/equipment-health.entity';
import { AlertService } from './services/alert.service';
import { DashboardService } from './services/dashboard.service';
import { ComplianceService } from './services/compliance.service';
import { IncidentService } from './services/incident.service';
import { EquipmentService } from './services/equipment.service';

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);

  constructor(
    @InjectRepository(SystemHealth)
    private systemHealthRepository: Repository<SystemHealth>,
    @InjectRepository(ClinicalAlert)
    private clinicalAlertRepository: Repository<ClinicalAlert>,
    @InjectRepository(ComplianceLog)
    private complianceLogRepository: Repository<ComplianceLog>,
    @InjectRepository(IncidentReport)
    private incidentReportRepository: Repository<IncidentReport>,
    @InjectRepository(EquipmentHealth)
    private equipmentHealthRepository: Repository<EquipmentHealth>,
    private alertService: AlertService,
    private dashboardService: DashboardService,
    private complianceService: ComplianceService,
    private incidentService: IncidentService,
    private equipmentService: EquipmentService,
  ) {}

  async startMonitoring() {
    this.logger.log('Starting healthcare system monitoring...');

    // Initialize monitoring systems
    await Promise.all([
      this.initializeSystemHealthMonitoring(),
      this.initializeClinicalAlerts(),
      this.initializeComplianceMonitoring(),
      this.initializeIncidentTracking(),
      this.initializeEquipmentMonitoring(),
    ]);

    this.logger.log('Healthcare system monitoring initialized successfully');
  }

  private async initializeSystemHealthMonitoring() {
    // Set up system health monitoring
    setInterval(async () => {
      const systemHealth = await this.dashboardService.collectSystemMetrics();
      await this.systemHealthRepository.save(systemHealth);

      if (systemHealth.status === 'critical') {
        await this.alertService.sendSystemAlert(systemHealth);
      }
    }, 60000); // Check every minute
  }

  private async initializeClinicalAlerts() {
    // Set up clinical alert monitoring
    setInterval(async () => {
      const alerts = await this.alertService.checkClinicalAlerts();
      for (const alert of alerts) {
        await this.clinicalAlertRepository.save(alert);
        await this.alertService.notifyRelevantStaff(alert);
      }
    }, 30000); // Check every 30 seconds
  }

  private async initializeComplianceMonitoring() {
    // Set up compliance monitoring
    setInterval(async () => {
      const complianceStatus = await this.complianceService.checkCompliance();
      await this.complianceLogRepository.save(complianceStatus);

      if (complianceStatus.status === 'non_compliant') {
        await this.alertService.sendComplianceAlert(complianceStatus);
      }
    }, 3600000); // Check every hour
  }

  private async initializeIncidentTracking() {
    // Set up incident tracking
    setInterval(async () => {
      const incidents = await this.incidentService.checkForNewIncidents();
      for (const incident of incidents) {
        await this.incidentReportRepository.save(incident);
        await this.alertService.sendIncidentAlert(incident);
      }
    }, 300000); // Check every 5 minutes
  }

  private async initializeEquipmentMonitoring() {
    // Set up equipment monitoring
    setInterval(async () => {
      const equipmentStatus =
        await this.equipmentService.checkEquipmentHealth();
      for (const status of equipmentStatus) {
        await this.equipmentHealthRepository.save(status);

        if (status.status === 'critical' || status.status === 'warning') {
          await this.alertService.sendEquipmentAlert(status);
        }
      }
    }, 300000); // Check every 5 minutes
  }

  async getSystemHealth() {
    return this.dashboardService.getSystemHealth();
  }

  async getClinicalAlerts() {
    return this.alertService.getActiveAlerts();
  }

  async getComplianceStatus() {
    return this.complianceService.getComplianceStatus();
  }

  async getIncidentReports() {
    return this.incidentService.getActiveIncidents();
  }

  async getEquipmentStatus() {
    return this.equipmentService.getEquipmentStatus();
  }

  async getDashboardMetrics() {
    return this.dashboardService.getDashboardMetrics();
  }
}
