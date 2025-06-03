import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImagingStudy } from './entities/imaging-study.entity';
import { DicomImage } from './entities/dicom-image.entity';
import { RadiologyReport } from './entities/radiology-report.entity';
import { ImagingEquipment } from './entities/imaging-equipment.entity';
import { RadiationDose } from './entities/radiation-dose.entity';
import { TeleradiologySession } from './entities/teleradiology-session.entity';

@Injectable()
export class RadiologyService {
  constructor(
    @InjectRepository(ImagingStudy)
    private imagingStudyRepository: Repository<ImagingStudy>,
    @InjectRepository(DicomImage)
    private dicomImageRepository: Repository<DicomImage>,
    @InjectRepository(RadiologyReport)
    private radiologyReportRepository: Repository<RadiologyReport>,
    @InjectRepository(ImagingEquipment)
    private imagingEquipmentRepository: Repository<ImagingEquipment>,
    @InjectRepository(RadiationDose)
    private radiationDoseRepository: Repository<RadiationDose>,
    @InjectRepository(TeleradiologySession)
    private teleradiologySessionRepository: Repository<TeleradiologySession>,
  ) {}

  // Imaging Study Management
  async createImagingStudy(study: Partial<ImagingStudy>): Promise<ImagingStudy> {
    const newStudy = this.imagingStudyRepository.create(study);
    return this.imagingStudyRepository.save(newStudy);
  }

  async scheduleStudy(studyId: string, scheduleData: any): Promise<ImagingStudy> {
    const study = await this.imagingStudyRepository.findOne({ where: { id: studyId } });
    if (!study) {
      throw new Error('Study not found');
    }

    Object.assign(study, scheduleData);
    study.status = 'scheduled';
    return this.imagingStudyRepository.save(study);
  }

  // DICOM Image Management
  async storeDicomImage(image: Partial<DicomImage>): Promise<DicomImage> {
    const newImage = this.dicomImageRepository.create(image);
    return this.dicomImageRepository.save(newImage);
  }

  async getDicomImages(studyId: string): Promise<DicomImage[]> {
    return this.dicomImageRepository.find({
      where: { study: { id: studyId } },
      order: { instanceNumber: 'ASC' },
    });
  }

  // Radiology Report Management
  async createReport(report: Partial<RadiologyReport>): Promise<RadiologyReport> {
    const newReport = this.radiologyReportRepository.create(report);
    return this.radiologyReportRepository.save(newReport);
  }

  async updateReportStatus(reportId: string, status: string): Promise<RadiologyReport> {
    const report = await this.radiologyReportRepository.findOne({ where: { id: reportId } });
    if (!report) {
      throw new Error('Report not found');
    }

    report.status = status as any;
    return this.radiologyReportRepository.save(report);
  }

  // Equipment Management
  async registerEquipment(equipment: Partial<ImagingEquipment>): Promise<ImagingEquipment> {
    const newEquipment = this.imagingEquipmentRepository.create(equipment);
    return this.imagingEquipmentRepository.save(newEquipment);
  }

  async scheduleMaintenance(equipmentId: string, maintenanceData: any): Promise<ImagingEquipment> {
    const equipment = await this.imagingEquipmentRepository.findOne({ where: { id: equipmentId } });
    if (!equipment) {
      throw new Error('Equipment not found');
    }

    equipment.maintenanceSchedule.push(maintenanceData);
    return this.imagingEquipmentRepository.save(equipment);
  }

  // Radiation Dose Tracking
  async recordRadiationDose(dose: Partial<RadiationDose>): Promise<RadiationDose> {
    const newDose = this.radiationDoseRepository.create(dose);
    newDose.safetyStatus = this.calculateSafetyStatus(newDose);
    return this.radiationDoseRepository.save(newDose);
  }

  private calculateSafetyStatus(dose: RadiationDose): 'within-limits' | 'exceeding-limits' | 'critical' {
    // Implement radiation safety limits and calculations
    if (dose.effectiveDose > 100) {
      return 'critical';
    } else if (dose.effectiveDose > 50) {
      return 'exceeding-limits';
    }
    return 'within-limits';
  }

  // Teleradiology Management
  async createTeleradiologySession(session: Partial<TeleradiologySession>): Promise<TeleradiologySession> {
    const newSession = this.teleradiologySessionRepository.create(session);
    return this.teleradiologySessionRepository.save(newSession);
  }

  async updateSessionStatus(sessionId: string, status: string): Promise<TeleradiologySession> {
    const session = await this.teleradiologySessionRepository.findOne({ where: { id: sessionId } });
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = status as any;
    if (status === 'completed') {
      session.endTime = new Date();
    }
    return this.teleradiologySessionRepository.save(session);
  }

  // Analytics and Reporting
  async getRadiologyAnalytics(): Promise<any> {
    const totalStudies = await this.imagingStudyRepository.count();
    const completedReports = await this.radiologyReportRepository.count({
      where: { status: 'final' },
    });
    const equipmentUtilization = await this.calculateEquipmentUtilization();
    const radiationSafetyMetrics = await this.calculateRadiationSafetyMetrics();

    return {
      studyVolume: totalStudies,
      reportCompletionRate: (completedReports / totalStudies) * 100,
      equipmentUtilization,
      radiationSafetyMetrics,
    };
  }

  private async calculateEquipmentUtilization(): Promise<any> {
    const equipment = await this.imagingEquipmentRepository.find();
    return equipment.map(eq => ({
      equipmentId: eq.equipmentId,
      utilization: (eq.studies?.length || 0) / 24, // Assuming 24-hour period
      status: eq.status,
    }));
  }

  private async calculateRadiationSafetyMetrics(): Promise<any> {
    const doses = await this.radiationDoseRepository.find();
    const criticalDoses = doses.filter(d => d.safetyStatus === 'critical').length;
    const exceedingDoses = doses.filter(d => d.safetyStatus === 'exceeding-limits').length;

    return {
      totalStudies: doses.length,
      criticalDoses,
      exceedingDoses,
      safetyCompliance: ((doses.length - criticalDoses - exceedingDoses) / doses.length) * 100,
    };
  }
} 