import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class IncidentReportService {
  constructor(
    @InjectRepository(IncidentReport)
    private incidentRepository: Repository<IncidentReport>,
    @InjectRepository(RootCauseAnalysis)
    private rcaRepository: Repository<RootCauseAnalysis>,
    @InjectRepository(CorrectiveAction)
    private actionRepository: Repository<CorrectiveAction>
  ) {}

  async create(dto: CreateIncidentReportDto): Promise<IncidentReport> {
    const incident = this.incidentRepository.create({
      ...dto,
      incidentDate: new Date(dto.incidentDate)
    });
    return this.incidentRepository.save(incident);
  }

  async findAll(filters?: any): Promise<IncidentReport[]> {
    const query = this.incidentRepository.createQueryBuilder('incident')
      .leftJoinAndSelect('incident.rootCauseAnalyses', 'rca')
      .leftJoinAndSelect('incident.correctiveActions', 'actions');

    if (filters?.severity) {
      query.andWhere('incident.severity = :severity', { severity: filters.severity });
    }
    if (filters?.status) {
      query.andWhere('incident.status = :status', { status: filters.status });
    }
    if (filters?.departmentId) {
      query.andWhere('incident.departmentId = :departmentId', { departmentId: filters.departmentId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<IncidentReport> {
    const incident = await this.incidentRepository.findOne({
      where: { id },
      relations: ['rootCauseAnalyses', 'correctiveActions']
    });
    if (!incident) {
      throw new NotFoundException('Incident report not found');
    }
    return incident;
  }

  async updateStatus(id: string, status: IncidentStatus): Promise<IncidentReport> {
    await this.incidentRepository.update(id, { status });
    return this.findOne(id);
  }

  async createRootCauseAnalysis(incidentId: string, analysis: any): Promise<RootCauseAnalysis> {
    const rca = this.rcaRepository.create({ ...analysis, incidentId });
    return this.rcaRepository.save(rca);
  }

  async createCorrectiveAction(incidentId: string, action: any): Promise<CorrectiveAction> {
    const ca = this.actionRepository.create({
      ...action,
      incidentId,
      dueDate: new Date(action.dueDate)
    });
    return this.actionRepository.save(ca);
  }

  async getIncidentStatistics(): Promise<any> {
    const total = await this.incidentRepository.count();
    const bySeverity = await this.incidentRepository
      .createQueryBuilder('incident')
      .select('incident.severity', 'severity')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.severity')
      .getRawMany();

    const byStatus = await this.incidentRepository
      .createQueryBuilder('incident')
      .select('incident.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('incident.status')
      .getRawMany();

    return { total, bySeverity, byStatus };
  }
}
