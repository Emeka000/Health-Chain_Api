import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { MonitoringService } from './monitoring.service';

@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('system-health')
  async getSystemHealth() {
    return this.monitoringService.getSystemHealth();
  }

  @Get('clinical-alerts')
  async getClinicalAlerts() {
    return this.monitoringService.getClinicalAlerts();
  }

  @Get('compliance-status')
  async getComplianceStatus() {
    return this.monitoringService.getComplianceStatus();
  }

  @Get('incident-reports')
  async getIncidentReports() {
    return this.monitoringService.getIncidentReports();
  }

  @Get('equipment-status')
  async getEquipmentStatus() {
    return this.monitoringService.getEquipmentStatus();
  }

  @Get('dashboard-metrics')
  async getDashboardMetrics() {
    return this.monitoringService.getDashboardMetrics();
  }
}
