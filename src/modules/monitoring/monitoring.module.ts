import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MonitoringService } from './monitoring.service';
import { MonitoringController } from './monitoring.controller';
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

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SystemHealth,
      ClinicalAlert,
      ComplianceLog,
      IncidentReport,
      EquipmentHealth,
    ]),
    ConfigModule,
  ],
  controllers: [MonitoringController],
  providers: [
    MonitoringService,
    AlertService,
    DashboardService,
    ComplianceService,
    IncidentService,
    EquipmentService,
  ],
  exports: [MonitoringService],
})
export class MonitoringModule {} 