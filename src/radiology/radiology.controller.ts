import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { RadiologyService } from './radiology.service';
import { ImagingStudy } from './entities/imaging-study.entity';
import { DicomImage } from './entities/dicom-image.entity';
import { RadiologyReport } from './entities/radiology-report.entity';
import { ImagingEquipment } from './entities/imaging-equipment.entity';
import { RadiationDose } from './entities/radiation-dose.entity';
import { TeleradiologySession } from './entities/teleradiology-session.entity';

@Controller('radiology')
export class RadiologyController {
  constructor(private readonly radiologyService: RadiologyService) {}

  // Imaging Study Management
  @Post('studies')
  async createImagingStudy(
    @Body() study: Partial<ImagingStudy>,
  ): Promise<ImagingStudy> {
    return this.radiologyService.createImagingStudy(study);
  }

  @Put('studies/:studyId/schedule')
  async scheduleStudy(
    @Param('studyId') studyId: string,
    @Body() scheduleData: any,
  ): Promise<ImagingStudy> {
    return this.radiologyService.scheduleStudy(studyId, scheduleData);
  }

  // DICOM Image Management
  @Post('studies/:studyId/dicom-images')
  async storeDicomImage(
    @Param('studyId') studyId: string,
    @Body() image: Partial<DicomImage>,
  ): Promise<DicomImage> {
    return this.radiologyService.storeDicomImage({
      ...image,
      study: { id: studyId },
    });
  }

  @Get('studies/:studyId/dicom-images')
  async getDicomImages(
    @Param('studyId') studyId: string,
  ): Promise<DicomImage[]> {
    return this.radiologyService.getDicomImages(studyId);
  }

  // Radiology Report Management
  @Post('studies/:studyId/reports')
  async createReport(
    @Param('studyId') studyId: string,
    @Body() report: Partial<RadiologyReport>,
  ): Promise<RadiologyReport> {
    return this.radiologyService.createReport({
      ...report,
      study: { id: studyId },
    });
  }

  @Put('reports/:reportId/status')
  async updateReportStatus(
    @Param('reportId') reportId: string,
    @Body('status') status: string,
  ): Promise<RadiologyReport> {
    return this.radiologyService.updateReportStatus(reportId, status);
  }

  // Equipment Management
  @Post('equipment')
  async registerEquipment(
    @Body() equipment: Partial<ImagingEquipment>,
  ): Promise<ImagingEquipment> {
    return this.radiologyService.registerEquipment(equipment);
  }

  @Put('equipment/:equipmentId/maintenance')
  async scheduleMaintenance(
    @Param('equipmentId') equipmentId: string,
    @Body() maintenanceData: any,
  ): Promise<ImagingEquipment> {
    return this.radiologyService.scheduleMaintenance(equipmentId, maintenanceData);
  }

  // Radiation Dose Tracking
  @Post('studies/:studyId/radiation-doses')
  async recordRadiationDose(
    @Param('studyId') studyId: string,
    @Body() dose: Partial<RadiationDose>,
  ): Promise<RadiationDose> {
    return this.radiologyService.recordRadiationDose({
      ...dose,
      study: { id: studyId },
    });
  }

  // Teleradiology Management
  @Post('studies/:studyId/teleradiology-sessions')
  async createTeleradiologySession(
    @Param('studyId') studyId: string,
    @Body() session: Partial<TeleradiologySession>,
  ): Promise<TeleradiologySession> {
    return this.radiologyService.createTeleradiologySession({
      ...session,
      study: { id: studyId },
    });
  }

  @Put('teleradiology-sessions/:sessionId/status')
  async updateSessionStatus(
    @Param('sessionId') sessionId: string,
    @Body('status') status: string,
  ): Promise<TeleradiologySession> {
    return this.radiologyService.updateSessionStatus(sessionId, status);
  }

  // Analytics and Reporting
  @Get('analytics')
  async getRadiologyAnalytics() {
    return this.radiologyService.getRadiologyAnalytics();
  }
} 