import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PathologyReport, ReportStatus } from '../entities/pathology-report.entity';
import { ReportTemplate } from '../entities/report-template.entity';
import { CreateReportDto, UpdateReportDto, ReportFilterDto } from '../dto/pathology-report.dto';

@Injectable()
export class PathologyReportService {
  constructor(
    @InjectRepository(PathologyReport)
    private reportRepository: Repository<PathologyReport>,
    @InjectRepository(ReportTemplate)
    private templateRepository: Repository<ReportTemplate>,
  ) {}

  async create(createDto: CreateReportDto): Promise<PathologyReport> {
    const reportNumber = await this.generateReportNumber();
    
    let templateStructure = null;
    if (createDto.templateId) {
      const template = await this.templateRepository.findOne({
        where: { id: createDto.templateId }
      });
      if (template) {
        templateStructure = template.templateStructure;
      }
    }

    const report = this.reportRepository.create({
      ...createDto,
      reportNumber,
      status: ReportStatus.DRAFT,
      reportDate: new Date(),
      templateUsed: createDto.templateId,
    });

    return await this.reportRepository.save(report);
  }

  async findAll(filters?: ReportFilterDto): Promise<PathologyReport[]> {
    const query = this.reportRepository.createQueryBuilder('report')
      .leftJoinAndSelect('report.pathologyCase', 'pathologyCase')
      .leftJoinAndSelect('report.author', 'author')
      .leftJoinAndSelect('report.verifiedBy', 'verifiedBy')
      .leftJoinAndSelect('pathologyCase.patient', 'patient');

    if (filters) {
      if (filters.status) {
        query.andWhere('report.status = :status', { status: filters.status });
      }
      if (filters.authorId) {
        query.andWhere('report.authorId = :authorId', { authorId: filters.authorId });
      }
      if (filters.pathologyCaseId) {
        query.andWhere('report.pathologyCaseId = :pathologyCaseId', { pathologyCaseId: filters.pathologyCaseId });
      }
      if (filters.diagnosisType) {
        query.andWhere('report.diagnosisType = :diagnosisType', { diagnosisType: filters.diagnosisType });
      }
      if (filters.dateFrom && filters.dateTo) {
        query.andWhere('report.reportDate BETWEEN :dateFrom AND :dateTo', {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        });
      }
      if (filters.search) {
        query.andWhere(
          '(report.reportNumber ILIKE :search OR report.diagnosis ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<PathologyReport> {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: [
        'pathologyCase',
        'pathologyCase.patient',
        'pathologyCase.requestingDoctor',
        'author',
        'verifiedBy'
      ],
    });

    if (!report) {
      throw new NotFoundException(`Pathology report with ID ${id} not found`);
    }

    return report;
  }

  async update(id: string, updateDto: UpdateReportDto): Promise<PathologyReport> {
    const report = await this.findOne(id);
    
    if (report.status === ReportStatus.FINAL && updateDto.status !== ReportStatus.AMENDED) {
      throw new BadRequestException('Final reports can only be amended, not modified');
    }

    Object.assign(report, updateDto);
    return await this.reportRepository.save(report);
  }

  async verifyReport(id: string, verifiedById: string): Promise<PathologyReport> {
    const report = await this.findOne(id);
    
    if (report.status !== ReportStatus.PRELIMINARY && report.status !== ReportStatus.DRAFT) {
      throw new BadRequestException('Only preliminary or draft reports can be verified');
    }

    report.status = ReportStatus.FINAL;
    report.verifiedBy = { id: verifiedById } as any;
    report.verifiedDate = new Date();
    report.isVerified = true;

    return await this.reportRepository.save(report);
  }

  async amendReport(id: string, amendmentData: any, amendedById: string): Promise<PathologyReport> {
    const report = await this.findOne(id);
    
    if (report.status !== ReportStatus.FINAL) {
      throw new BadRequestException('Only final reports can be amended');
    }

    report.status = ReportStatus.AMENDED;
    Object.assign(report, amendmentData);
    report.verifiedBy = { id: amendedById } as any;
    report.verifiedDate = new Date();

    return await this.reportRepository.save(report);
  }

  async generateFromTemplate(templateId: string, pathologyCaseId: string): Promise<any> {
    const template = await this.templateRepository.findOne({
      where: { id: templateId }
    });

    if (!template) {
      throw new NotFoundException(`Template with ID ${templateId} not found`);
    }

    return {
      templateStructure: template.templateStructure,
      macroscopicTemplate: template.macroscopicTemplate,
      microscopicTemplate: template.microscopicTemplate,
      diagnosisTemplate: template.diagnosisTemplate,
      synopticReporting: template.synopticReporting,
      standardizedPhrases: template.standardizedPhrases
    };
  }

  async getReportsByCase(caseId: string): Promise<PathologyReport[]> {
    return await this.reportRepository.find({
      where: { pathologyCase: { id: caseId } },
      relations: ['author', 'verifiedBy'],
      order: { createdAt: 'DESC' }
    });
  }

  async getPendingReports(): Promise<PathologyReport[]> {
    return await this.reportRepository.find({
      where: { status: ReportStatus.DRAFT },
      relations: ['pathologyCase', 'pathologyCase.patient', 'author']
    });
  }

  async getReportStatistics(): Promise<any> {
    const totalReports = await this.reportRepository.count();
    const draftReports = await this.reportRepository.count({ where: { status: ReportStatus.DRAFT } });
    const preliminaryReports = await this.reportRepository.count({ where: { status: ReportStatus.PRELIMINARY } });
    const finalReports = await this.reportRepository.count({ where: { status: ReportStatus.FINAL } });
    const amendedReports = await this.reportRepository.count({ where: { status: ReportStatus.AMENDED } });

    const diagnosisDistribution = await this.reportRepository
      .createQueryBuilder('report')
      .select('report.diagnosisType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('report.diagnosisType')
      .getRawMany();

    return {
      totalReports,
      draftReports,
      preliminaryReports,
      finalReports,
      amendedReports,
      diagnosisDistribution
    };
  }

  private async generateReportNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.reportRepository.count();
    return `RPT-${year}-${String(count + 1).padStart(6, '0')}`;
  }