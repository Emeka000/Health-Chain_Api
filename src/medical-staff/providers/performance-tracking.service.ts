import { Injectable } from '@nestjs/common';
import { type Repository, Between } from 'typeorm';
import { PerformanceMetric } from '../entities/performance-metric.entity';
import { Doctor } from '../entities/doctor.entity';
import { Department } from '../entities/department.entity';
import { CreatePerformanceMetricDto } from '../dto/create-performance-metric.dto';
import { MetricType } from '../enums/metric-type.enum';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PerformanceTrackingService {
  constructor(
    @InjectRepository(PerformanceMetric)
    private metricRepository: Repository<PerformanceMetric>,

    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,

    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async createPerformanceMetric(
    createMetricDto: CreatePerformanceMetricDto,
  ): Promise<PerformanceMetric> {
    const metric = this.metricRepository.create(createMetricDto);
    return this.metricRepository.save(metric);
  }

  async getDoctorPerformance(
    doctorId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    doctor: Doctor;
    metrics: PerformanceMetric[];
    summary: {
      patientSatisfactionAvg: number;
      treatmentSuccessRate: number;
      averageConsultationTime: number;
      totalPatients: number;
      qualityScore: number;
    };
    trends: {
      patientSatisfactionTrend: number;
      treatmentSuccessTrend: number;
      efficiencyTrend: number;
    };
  }> {
    const doctor = await this.doctorRepository.findOne({
      where: { id: doctorId },
      relations: ['department', 'specialties'],
    });

    if (!doctor) {
      throw new Error('Doctor not found');
    }

    const query = this.metricRepository
      .createQueryBuilder('metric')
      .where('metric.doctorId = :doctorId', { doctorId });

    if (startDate && endDate) {
      query.andWhere('metric.recordedDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    const metrics = await query
      .orderBy('metric.recordedDate', 'DESC')
      .getMany();

    // Calculate summary statistics
    const summary = this.calculatePerformanceSummary(metrics);
    const trends = await this.calculatePerformanceTrends(
      doctorId,
      startDate,
      endDate,
    );

    return {
      doctor,
      metrics,
      summary,
      trends,
    };
  }

  async getDepartmentPerformanceSummary(departmentId?: string): Promise<{
    departments: Array<{
      department: Department;
      doctorCount: number;
      averagePerformance: {
        patientSatisfaction: number;
        treatmentSuccess: number;
        efficiency: number;
        qualityScore: number;
      };
      topPerformers: Doctor[];
      improvementAreas: string[];
    }>;
    overallSummary: {
      totalDoctors: number;
      averageQualityScore: number;
      topDepartment: string;
      improvementRecommendations: string[];
    };
  }> {
    const query = this.departmentRepository
      .createQueryBuilder('department')
      .leftJoinAndSelect('department.doctors', 'doctors')
      .leftJoinAndSelect('doctors.performanceMetrics', 'metrics');

    if (departmentId) {
      query.where('department.id = :departmentId', { departmentId });
    }

    const departments = await query.getMany();

    const departmentSummaries = await Promise.all(
      departments.map(async (department) => {
        const activeDoctors = department.doctors.filter(
          (d) => d.status === 'ACTIVE',
        );
        const departmentMetrics = activeDoctors.flatMap(
          (d) => d.performanceMetrics || [],
        );

        const averagePerformance =
          this.calculateDepartmentAverages(departmentMetrics);
        const topPerformers = this.identifyTopPerformers(activeDoctors);
        const improvementAreas =
          this.identifyImprovementAreas(departmentMetrics);

        return {
          department,
          doctorCount: activeDoctors.length,
          averagePerformance,
          topPerformers,
          improvementAreas,
        };
      }),
    );

    const overallSummary = this.calculateOverallSummary(departmentSummaries);

    return {
      departments: departmentSummaries,
      overallSummary,
    };
  }

  private calculatePerformanceSummary(metrics: PerformanceMetric[]): {
    patientSatisfactionAvg: number;
    treatmentSuccessRate: number;
    averageConsultationTime: number;
    totalPatients: number;
    qualityScore: number;
  } {
    if (metrics.length === 0) {
      return {
        patientSatisfactionAvg: 0,
        treatmentSuccessRate: 0,
        averageConsultationTime: 0,
        totalPatients: 0,
        qualityScore: 0,
      };
    }

    const satisfactionMetrics = metrics.filter(
      (m) => m.metricType === MetricType.PATIENT_SATISFACTION,
    );
    const treatmentMetrics = metrics.filter(
      (m) => m.metricType === MetricType.TREATMENT_SUCCESS_RATE,
    );
    const consultationMetrics = metrics.filter(
      (m) => m.metricType === MetricType.CONSULTATION_TIME,
    );
    const patientCountMetrics = metrics.filter(
      (m) => m.metricType === MetricType.PATIENT_COUNT,
    );

    const patientSatisfactionAvg =
      satisfactionMetrics.length > 0
        ? satisfactionMetrics.reduce((sum, m) => sum + m.value, 0) /
          satisfactionMetrics.length
        : 0;

    const treatmentSuccessRate =
      treatmentMetrics.length > 0
        ? treatmentMetrics.reduce((sum, m) => sum + m.value, 0) /
          treatmentMetrics.length
        : 0;

    const averageConsultationTime =
      consultationMetrics.length > 0
        ? consultationMetrics.reduce((sum, m) => sum + m.value, 0) /
          consultationMetrics.length
        : 0;

    const totalPatients = patientCountMetrics.reduce(
      (sum, m) => sum + m.value,
      0,
    );

    // Calculate composite quality score
    const qualityScore =
      patientSatisfactionAvg * 0.4 + treatmentSuccessRate * 0.6;

    return {
      patientSatisfactionAvg,
      treatmentSuccessRate,
      averageConsultationTime,
      totalPatients,
      qualityScore,
    };
  }

  private async calculatePerformanceTrends(
    doctorId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    patientSatisfactionTrend: number;
    treatmentSuccessTrend: number;
    efficiencyTrend: number;
  }> {
    // Get metrics from previous period for comparison
    const currentPeriodEnd = endDate || new Date();
    const currentPeriodStart =
      startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    const periodLength =
      currentPeriodEnd.getTime() - currentPeriodStart.getTime();
    const previousPeriodEnd = new Date(currentPeriodStart.getTime());
    const previousPeriodStart = new Date(
      currentPeriodStart.getTime() - periodLength,
    );

    const currentMetrics = await this.metricRepository.find({
      where: {
        doctorId,
        recordedDate: Between(currentPeriodStart, currentPeriodEnd),
      },
    });

    const previousMetrics = await this.metricRepository.find({
      where: {
        doctorId,
        recordedDate: Between(previousPeriodStart, previousPeriodEnd),
      },
    });

    const currentSummary = this.calculatePerformanceSummary(currentMetrics);
    const previousSummary = this.calculatePerformanceSummary(previousMetrics);

    return {
      patientSatisfactionTrend: this.calculateTrendPercentage(
        previousSummary.patientSatisfactionAvg,
        currentSummary.patientSatisfactionAvg,
      ),
      treatmentSuccessTrend: this.calculateTrendPercentage(
        previousSummary.treatmentSuccessRate,
        currentSummary.treatmentSuccessRate,
      ),
      efficiencyTrend: this.calculateTrendPercentage(
        previousSummary.averageConsultationTime,
        currentSummary.averageConsultationTime,
        true, // Lower is better for consultation time
      ),
    };
  }

  private calculateTrendPercentage(
    previousValue: number,
    currentValue: number,
    lowerIsBetter = false,
  ): number {
    if (previousValue === 0) return 0;

    const change = ((currentValue - previousValue) / previousValue) * 100;
    return lowerIsBetter ? -change : change;
  }

  private calculateDepartmentAverages(metrics: PerformanceMetric[]): {
    patientSatisfaction: number;
    treatmentSuccess: number;
    efficiency: number;
    qualityScore: number;
  } {
    const summary = this.calculatePerformanceSummary(metrics);
    return {
      patientSatisfaction: summary.patientSatisfactionAvg,
      treatmentSuccess: summary.treatmentSuccessRate,
      efficiency: 100 - summary.averageConsultationTime, // Convert to efficiency score
      qualityScore: summary.qualityScore,
    };
  }

  private identifyTopPerformers(doctors: Doctor[]): Doctor[] {
    // Sort doctors by their quality scores and return top 3
    return doctors
      .map((doctor) => ({
        doctor,
        qualityScore: this.calculatePerformanceSummary(
          doctor.performanceMetrics || [],
        ).qualityScore,
      }))
      .sort((a, b) => b.qualityScore - a.qualityScore)
      .slice(0, 3)
      .map((item) => item.doctor);
  }

  private identifyImprovementAreas(metrics: PerformanceMetric[]): string[] {
    const summary = this.calculatePerformanceSummary(metrics);
    const areas: string[] = [];

    if (summary.patientSatisfactionAvg < 80) {
      areas.push('Patient Satisfaction');
    }
    if (summary.treatmentSuccessRate < 85) {
      areas.push('Treatment Success Rate');
    }
    if (summary.averageConsultationTime > 30) {
      areas.push('Consultation Efficiency');
    }

    return areas;
  }

  private calculateOverallSummary(departmentSummaries: any[]): {
    totalDoctors: number;
    averageQualityScore: number;
    topDepartment: string;
    improvementRecommendations: string[];
  } {
    const totalDoctors = departmentSummaries.reduce(
      (sum, dept) => sum + dept.doctorCount,
      0,
    );

    const averageQualityScore =
      departmentSummaries.length > 0
        ? departmentSummaries.reduce(
            (sum, dept) => sum + dept.averagePerformance.qualityScore,
            0,
          ) / departmentSummaries.length
        : 0;

    const topDepartment =
      departmentSummaries.length > 0
        ? departmentSummaries.reduce((top, dept) =>
            dept.averagePerformance.qualityScore >
            top.averagePerformance.qualityScore
              ? dept
              : top,
          ).department.name
        : 'N/A';

    const improvementRecommendations = [
      'Implement regular performance reviews',
      'Provide targeted training for low-performing areas',
      'Establish peer mentoring programs',
      'Optimize scheduling to reduce consultation times',
    ];

    return {
      totalDoctors,
      averageQualityScore,
      topDepartment,
      improvementRecommendations,
    };
  }
}
