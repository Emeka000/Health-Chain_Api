import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IcuBed } from './entities/icu-bed.entity';
import { IcuPatient } from './entities/icu-patient.entity';
import { VitalSigns } from './entities/vital-signs.entity';
import { Ventilator } from './entities/ventilator.entity';
import { Medication } from './entities/medication.entity';
import { Intervention } from './entities/intervention.entity';
import { QualityMetrics } from './entities/quality-metrics.entity';
import { FamilyCommunication } from './entities/family-communication.entity';

@Injectable()
export class IcuService {
  constructor(
    @InjectRepository(IcuBed)
    private icuBedRepository: Repository<IcuBed>,
    @InjectRepository(IcuPatient)
    private icuPatientRepository: Repository<IcuPatient>,
    @InjectRepository(VitalSigns)
    private vitalSignsRepository: Repository<VitalSigns>,
    @InjectRepository(Ventilator)
    private ventilatorRepository: Repository<Ventilator>,
    @InjectRepository(Medication)
    private medicationRepository: Repository<Medication>,
    @InjectRepository(Intervention)
    private interventionRepository: Repository<Intervention>,
    @InjectRepository(QualityMetrics)
    private qualityMetricsRepository: Repository<QualityMetrics>,
    @InjectRepository(FamilyCommunication)
    private familyCommunicationRepository: Repository<FamilyCommunication>,
  ) {}

  // Bed Management
  async assignBed(patientId: string, bedId: string): Promise<IcuBed> {
    const bed = await this.icuBedRepository.findOne({ where: { id: bedId } });
    const patient = await this.icuPatientRepository.findOne({ where: { id: patientId } });
    
    if (!bed || !patient) {
      throw new Error('Bed or patient not found');
    }
    
    bed.patient = patient;
    bed.status = 'occupied';
    return this.icuBedRepository.save(bed);
  }

  // Vital Signs Monitoring
  async recordVitalSigns(patientId: string, vitalSigns: Partial<VitalSigns>): Promise<VitalSigns> {
    const patient = await this.icuPatientRepository.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new Error('Patient not found');
    }

    const newVitalSigns = this.vitalSignsRepository.create({
      ...vitalSigns,
      patient,
    });

    // Check for critical values and set alert status
    newVitalSigns.alertStatus = this.calculateAlertStatus(newVitalSigns);
    
    return this.vitalSignsRepository.save(newVitalSigns);
  }

  private calculateAlertStatus(vitalSigns: VitalSigns): 'normal' | 'warning' | 'critical' {
    // Implement logic to determine alert status based on vital signs
    // This is a simplified example
    if (
      vitalSigns.heartRate > 120 ||
      vitalSigns.heartRate < 60 ||
      vitalSigns.bloodPressureSystolic > 160 ||
      vitalSigns.bloodPressureSystolic < 90 ||
      vitalSigns.oxygenSaturation < 90
    ) {
      return 'critical';
    }
    return 'normal';
  }

  // Ventilator Management
  async updateVentilatorSettings(ventilatorId: string, settings: Partial<Ventilator>): Promise<Ventilator> {
    const ventilator = await this.ventilatorRepository.findOne({ where: { id: ventilatorId } });
    if (!ventilator) {
      throw new Error('Ventilator not found');
    }

    Object.assign(ventilator, settings);
    ventilator.lastUpdated = new Date();
    return this.ventilatorRepository.save(ventilator);
  }

  // Medication Management
  async prescribeMedication(patientId: string, medication: Partial<Medication>): Promise<Medication> {
    const patient = await this.icuPatientRepository.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new Error('Patient not found');
    }

    const newMedication = this.medicationRepository.create({
      ...medication,
      patient,
      status: 'active',
    });

    return this.medicationRepository.save(newMedication);
  }

  // Intervention Documentation
  async recordIntervention(patientId: string, intervention: Partial<Intervention>): Promise<Intervention> {
    const patient = await this.icuPatientRepository.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new Error('Patient not found');
    }

    const newIntervention = this.interventionRepository.create({
      ...intervention,
      patient,
      performedAt: new Date(),
    });

    return this.interventionRepository.save(newIntervention);
  }

  // Quality Metrics
  async updateQualityMetrics(patientId: string, metrics: Partial<QualityMetrics>): Promise<QualityMetrics> {
    const patient = await this.icuPatientRepository.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new Error('Patient not found');
    }

    const newMetrics = this.qualityMetricsRepository.create({
      ...metrics,
      patient,
      recordedAt: new Date(),
    });

    return this.qualityMetricsRepository.save(newMetrics);
  }

  // Family Communication
  async updateFamilyCommunication(
    patientId: string,
    communication: Partial<FamilyCommunication>,
  ): Promise<FamilyCommunication> {
    const patient = await this.icuPatientRepository.findOne({ where: { id: patientId } });
    if (!patient) {
      throw new Error('Patient not found');
    }

    const newCommunication = this.familyCommunicationRepository.create({
      ...communication,
      patient,
    });

    return this.familyCommunicationRepository.save(newCommunication);
  }

  // Analytics and Reporting
  async getIcuAnalytics(): Promise<any> {
    const totalBeds = await this.icuBedRepository.count();
    const occupiedBeds = await this.icuBedRepository.count({ where: { status: 'occupied' } });
    const criticalPatients = await this.icuPatientRepository.count({ where: { severity: 'critical' } });
    
    const qualityMetrics = await this.qualityMetricsRepository.find({
      relations: ['patient'],
    });

    return {
      bedUtilization: (occupiedBeds / totalBeds) * 100,
      criticalPatientCount: criticalPatients,
      averageLengthOfStay: this.calculateAverageLengthOfStay(qualityMetrics),
      infectionRates: this.calculateInfectionRates(qualityMetrics),
    };
  }

  private calculateAverageLengthOfStay(metrics: QualityMetrics[]): number {
    if (metrics.length === 0) return 0;
    const total = metrics.reduce((sum, metric) => sum + metric.lengthOfStay, 0);
    return total / metrics.length;
  }

  private calculateInfectionRates(metrics: QualityMetrics[]): any {
    const total = metrics.length;
    if (total === 0) return { vap: 0, clabsi: 0, cauti: 0 };

    return {
      vap: (metrics.filter(m => m.ventilatorAssociatedPneumonia).length / total) * 100,
      clabsi: (metrics.filter(m => m.centralLineAssociatedBloodstreamInfection).length / total) * 100,
      cauti: (metrics.filter(m => m.catheterAssociatedUrinaryTractInfection).length / total) * 100,
    };
  }
} 