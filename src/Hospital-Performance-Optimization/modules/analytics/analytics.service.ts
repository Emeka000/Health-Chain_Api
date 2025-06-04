import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Patient } from '../../entities/patient.entity';
import { Appointment } from '../../entities/appointment.entity';
import { MedicalRecord } from '../../entities/medical-record.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(MedicalRecord)
    private medicalRecordRepository: Repository<MedicalRecord>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async getDashboardMetrics(): Promise<any> {
    const cacheKey = 'dashboard_metrics';
    let metrics = await this.cacheManager.get(cacheKey);
    
    if (!metrics) {
      const [
        totalPatients,
        todayAppointments,
        pendingAppointments,
        recentMedicalRecords,
      ] = await Promise.all([
        this.patientRepository.count(),
        this.getTodayAppointmentsCount(),
        this.getPendingAppointmentsCount(),
        this.getRecentMedicalRecordsCount(),
      ]);

      metrics = {
        totalPatients,
        todayAppointments,
        pendingAppointments,
        recentMedicalRecords,
        lastUpdated: new Date(),
      };
      
      await this.cacheManager.set(cacheKey, metrics, 300); // Cache for 5 minutes
    }
    
    return metrics;
  }

  async getPatientFlowAnalytics(): Promise<any> {
    const cacheKey = 'patient_flow_analytics';
    let analytics = await this.cacheManager.get(cacheKey);
    
    if (!analytics) {
      const query = `
        SELECT 
          DATE(appointment_date) as date,
          COUNT(*) as appointment_count,
          AVG(duration) as avg_duration,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count
        FROM appointments 
        WHERE appointment_date >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        GROUP BY DATE(appointment_date)
        ORDER BY date DESC
      `;
      
      analytics = await this.appointmentRepository.query(query);
      await this.cacheManager.set(cacheKey, analytics, 900); // Cache for 15 minutes
    }
    
    return analytics;
  }

  async getResourceUtilization(): Promise<any> {
    const cacheKey = 'resource_utilization';
    let utilization = await this.cacheManager.get(cacheKey);
    
    if (!utilization) {
      // Calculate room/doctor utilization
      const query = `
        SELECT 
          doctor_id,
          COUNT(*) as total_appointments,
          SUM(duration) as total_minutes,
          AVG(duration) as avg_appointment_duration
        FROM appointments 
        WHERE appointment_date >= DATE_SUB(NOW(), INTERVAL 1 WEEK)
        GROUP BY doctor_id
        ORDER BY total_appointments DESC
      `;
      
      utilization = await this.appointmentRepository.query(query);
      await this.cacheManager.set(cacheKey, utilization, 600); // Cache for 10 minutes
    }
    
    return utilization;
  }

  // Scheduled task to pre-compute analytics
  @Cron(CronExpression.EVERY_5_MINUTES)
  async preComputeAnalytics(): Promise<void> {
    console.log('Pre-computing analytics...');
    
    // Pre-compute and cache frequently accessed analytics
    await Promise.all([
      this.getDashboardMetrics(),
      this.getPatientFlowAnalytics(),
      this.getResourceUtilization(),
    ]);
    
    console.log('Analytics pre-computation completed');
  }

  private async getTodayAppointmentsCount(): Promise<number> {
    return this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('DATE(appointment.appointmentDate) = CURDATE()')
      .getCount();
  }

  private async getPendingAppointmentsCount(): Promise<number> {
    return this.appointmentRepository
      .createQueryBuilder('appointment')
      .where('appointment.status = :status', { status: 'scheduled' })
      .andWhere('appointment.appointmentDate > NOW()')
      .getCount();
  }

  private async getRecentMedicalRecordsCount(): Promise<number> {
    return this.medicalRecordRepository
      .createQueryBuilder('record')
      .where('DATE(record.createdAt) = CURDATE()')
      .getCount();
  }
}
