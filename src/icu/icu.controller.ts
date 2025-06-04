import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { IcuService } from './icu.service';
import { IcuBed } from './entities/icu-bed.entity';
import { IcuPatient } from './entities/icu-patient.entity';
import { VitalSigns } from './entities/vital-signs.entity';
import { Ventilator } from './entities/ventilator.entity';
import { Medication } from './entities/medication.entity';
import { Intervention } from './entities/intervention.entity';
import { QualityMetrics } from './entities/quality-metrics.entity';
import { FamilyCommunication } from './entities/family-communication.entity';

@Controller('icu')
export class IcuController {
  constructor(private readonly icuService: IcuService) {}

  // Bed Management
  @Post('beds/assign')
  async assignBed(
    @Body() data: { patientId: string; bedId: string },
  ): Promise<IcuBed> {
    return this.icuService.assignBed(data.patientId, data.bedId);
  }

  // Vital Signs
  @Post('patients/:patientId/vital-signs')
  async recordVitalSigns(
    @Param('patientId') patientId: string,
    @Body() vitalSigns: Partial<VitalSigns>,
  ): Promise<VitalSigns> {
    return this.icuService.recordVitalSigns(patientId, vitalSigns);
  }

  // Ventilator Management
  @Put('ventilators/:ventilatorId')
  async updateVentilatorSettings(
    @Param('ventilatorId') ventilatorId: string,
    @Body() settings: Partial<Ventilator>,
  ): Promise<Ventilator> {
    return this.icuService.updateVentilatorSettings(ventilatorId, settings);
  }

  // Medication Management
  @Post('patients/:patientId/medications')
  async prescribeMedication(
    @Param('patientId') patientId: string,
    @Body() medication: Partial<Medication>,
  ): Promise<Medication> {
    return this.icuService.prescribeMedication(patientId, medication);
  }

  // Intervention Documentation
  @Post('patients/:patientId/interventions')
  async recordIntervention(
    @Param('patientId') patientId: string,
    @Body() intervention: Partial<Intervention>,
  ): Promise<Intervention> {
    return this.icuService.recordIntervention(patientId, intervention);
  }

  // Quality Metrics
  @Post('patients/:patientId/quality-metrics')
  async updateQualityMetrics(
    @Param('patientId') patientId: string,
    @Body() metrics: Partial<QualityMetrics>,
  ): Promise<QualityMetrics> {
    return this.icuService.updateQualityMetrics(patientId, metrics);
  }

  // Family Communication
  @Post('patients/:patientId/family-communication')
  async updateFamilyCommunication(
    @Param('patientId') patientId: string,
    @Body() communication: Partial<FamilyCommunication>,
  ): Promise<FamilyCommunication> {
    return this.icuService.updateFamilyCommunication(patientId, communication);
  }

  // Analytics and Reporting
  @Get('analytics')
  async getIcuAnalytics() {
    return this.icuService.getIcuAnalytics();
  }
} 