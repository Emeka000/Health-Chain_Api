import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { MonitoringData, MonitoringType } from './entities/monitoring-data.entity';
import { User } from '../users/entities/user.entity';
import { CreateMonitoringDataDto } from './dto/create-monitoring-data.dto';

@Injectable()
export class MonitoringService {
  constructor(
    @InjectRepository(MonitoringData)
    private monitoringDataRepository: Repository<MonitoringData>,
  ) {}

  async create(createMonitoringDataDto: CreateMonitoringDataDto): Promise<MonitoringData> {
    const data = this.monitoringDataRepository.create(createMonitoringDataDto);
    
    // Check for alert conditions
    this.checkAlertConditions(data);
    
    return this.monitoringDataRepository.save(data);
  }

  async getPatientData(patientId: string, type?: MonitoringType, days = 30): Promise<MonitoringData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const where: any = {
      patient: { id: patientId },
      measuredAt: Between(startDate, new Date()),
    };

    if (type) {
      where.type = type;
    }

    return this.monitoringDataRepository.find({
      where,
      relations: ['patient'],
      order: { measuredAt: 'DESC' },
    });
  }

  async getAlerts(patientId?: string): Promise<MonitoringData[]> {
    const where: any = { isAlert: true };
    
    if (patientId) {
      where.patient = { id: patientId };
    }

    return this.monitoringDataRepository.find({
      where,
      relations: ['patient'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTrends(patientId: string, type: MonitoringType, days = 30): Promise<any> {
    const data = await this.getPatientData(patientId, type, days);
    
    if (data.length < 2) {
      return { trend: 'insufficient_data', data };
    }

    const values = data.map(d => d.value).reverse();
    const trend = this.calculateTrend(values);
    
    return {
      trend,
      average: values.reduce((a, b) => a + b, 0) / values.length,
      latest: values[values.length - 1],
      data,
    };
  }

  private checkAlertConditions(data: MonitoringData): void {
    const alertRanges = {
      [MonitoringType.HEART_RATE]: { min: 60, max: 100 },
      [MonitoringType.BLOOD_PRESSURE]: { min: 90, max: 140 }, // systolic
      [MonitoringType.TEMPERATURE]: { min: 36.1, max: 37.2 },
      [MonitoringType.OXYGEN_SATURATION]: { min: 95, max: 100 },
      [MonitoringType.GLUCOSE]: { min: 70, max: 140 },
    };

    const range = alertRanges[data.type];
    if (range && (data.value < range.min || data.value > range.max)) {
      data.isAlert = true;
      data.alertMessage = `${data.type} value ${data.value} is outside normal range (${range.min}-${range.max})`;
    }
  }

  private calculateTrend(values: number[]): string {
    if (values.length < 3) return 'stable';
    
    const recent = values.slice(-3);
    const earlier = values.slice(-6, -3);
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
    
    const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;
    
    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }
}