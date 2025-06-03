import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { PathologyCase, CaseStatus, CaseType, Priority } from '../entities/pathology-case.entity';
import { CreatePathologyCaseDto, UpdatePathologyCaseDto, PathologyCaseFilterDto } from '../dto/pathology-case.dto';

@Injectable()
export class PathologyCaseService {
  constructor(
    @InjectRepository(PathologyCase)
    private pathologyCaseRepository: Repository<PathologyCase>,
  ) {}

  async create(createDto: CreatePathologyCaseDto): Promise<PathologyCase> {
    const caseNumber = await this.generateCaseNumber();
    
    const pathologyCase = this.pathologyCaseRepository.create({
      ...createDto,
      caseNumber,
      status: CaseStatus.RECEIVED,
      receivedDate: new Date(),
    });

    return await this.pathologyCaseRepository.save(pathologyCase) as unknown as PathologyCase;
  }

  async findAll(filters?: PathologyCaseFilterDto): Promise<PathologyCase[]> {
    const query = this.pathologyCaseRepository.createQueryBuilder('case')
      .leftJoinAndSelect('case.patient', 'patient')
      .leftJoinAndSelect('case.requestingDoctor', 'requestingDoctor')
      .leftJoinAndSelect('case.pathologist', 'pathologist')
      .leftJoinAndSelect('case.reports', 'reports')
      .leftJoinAndSelect('case.images', 'images');

    if (filters) {
      if (filters.status) {
        query.andWhere('case.status = :status', { status: filters.status });
      }
      if (filters.caseType) {
        query.andWhere('case.caseType = :caseType', { caseType: filters.caseType });
      }
      if (filters.priority) {
        query.andWhere('case.priority = :priority', { priority: filters.priority });
      }
      if (filters.patientId) {
        query.andWhere('case.patientId = :patientId', { patientId: filters.patientId });
      }
      if (filters.pathologistId) {
        query.andWhere('case.pathologistId = :pathologistId', { pathologistId: filters.pathologistId });
      }
      if (filters.dateFrom && filters.dateTo) {
        query.andWhere('case.receivedDate BETWEEN :dateFrom AND :dateTo', {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        });
      }
      if (filters.search) {
        query.andWhere(
          '(case.caseNumber ILIKE :search OR patient.firstName ILIKE :search OR patient.lastName ILIKE :search)',
          { search: `%${filters.search}%` }
        );
      }
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<PathologyCase> {
    const pathologyCase = await this.pathologyCaseRepository.findOne({
      where: { id },
      relations: [
        'patient',
        'requestingDoctor',
        'pathologist',
        'reports',
        'reports.author',
        'reports.verifiedBy',
        'images',
        'qualityAssurances',
        'qualityAssurances.initiatedBy',
        'qualityAssurances.reviewer'
      ],
    });

    if (!pathologyCase) {
      throw new NotFoundException(`Pathology case with ID ${id} not found`);
    }

    return pathologyCase;
  }

  async update(id: string, updateDto: UpdatePathologyCaseDto): Promise<PathologyCase> {
    const pathologyCase = await this.findOne(id);
    
    if (updateDto.status && !this.isValidStatusTransition(pathologyCase.status, updateDto.status)) {
      throw new BadRequestException(`Invalid status transition from ${pathologyCase.status} to ${updateDto.status}`);
    }

    Object.assign(pathologyCase, updateDto);

    if (updateDto.status === CaseStatus.COMPLETED) {
      pathologyCase.completedDate = new Date();
    }

    return await this.pathologyCaseRepository.save(pathologyCase);
  }

  async assignPathologist(caseId: string, pathologistId: string): Promise<PathologyCase> {
    const pathologyCase = await this.findOne(caseId);
    pathologyCase.pathologist = { id: pathologistId } as any;
    pathologyCase.status = CaseStatus.IN_PROGRESS;
    
    return await this.pathologyCaseRepository.save(pathologyCase);
  }

  async updateStatus(id: string, status: CaseStatus): Promise<PathologyCase> {
    const pathologyCase = await this.findOne(id);
    
    if (!this.isValidStatusTransition(pathologyCase.status, status)) {
      throw new BadRequestException(`Invalid status transition from ${pathologyCase.status} to ${status}`);
    }

    pathologyCase.status = status;
    
    if (status === CaseStatus.COMPLETED) {
      pathologyCase.completedDate = new Date();
    }

    return await this.pathologyCaseRepository.save(pathologyCase);
  }

  async getDashboardStats(): Promise<any> {
    const totalCases = await this.pathologyCaseRepository.count();
    const pendingCases = await this.pathologyCaseRepository.count({ where: { status: CaseStatus.RECEIVED } });
    const inProgressCases = await this.pathologyCaseRepository.count({ where: { status: CaseStatus.IN_PROGRESS } });
    const completedToday = await this.pathologyCaseRepository.count({
      where: {
        status: CaseStatus.COMPLETED,
        completedDate: Between(new Date(new Date().setHours(0, 0, 0, 0)), new Date())
      }
    });

    const urgentCases = await this.pathologyCaseRepository.count({
      where: { priority: In([Priority.URGENT, Priority.STAT]) }
    });

    const casesByType = await this.pathologyCaseRepository
      .createQueryBuilder('case')
      .select('case.caseType', 'type')
      .addSelect('COUNT(*)', 'count')
      .groupBy('case.caseType')
      .getRawMany();

    return {
      totalCases,
      pendingCases,
      inProgressCases,
      completedToday,
      urgentCases,
      casesByType
    };
  }

  async getOverdueCases(): Promise<PathologyCase[]> {
    const currentDate = new Date();
    
    return await this.pathologyCaseRepository.find({
      where: {
        status: In([CaseStatus.RECEIVED, CaseStatus.IN_PROGRESS]),
        expectedCompletionDate: Between(new Date('1900-01-01'), currentDate)
      },
      relations: ['patient', 'pathologist']
    });
  }

  private async generateCaseNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.pathologyCaseRepository.count();
    return `PATH-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  private isValidStatusTransition(currentStatus: CaseStatus, newStatus: CaseStatus): boolean {
    const validTransitions: Record<CaseStatus, CaseStatus[]> = {
      [CaseStatus.RECEIVED]: [CaseStatus.IN_PROGRESS, CaseStatus.ARCHIVED],
      [CaseStatus.IN_PROGRESS]: [CaseStatus.REVIEWED, CaseStatus.RECEIVED],
      [CaseStatus.REVIEWED]: [CaseStatus.COMPLETED, CaseStatus.IN_PROGRESS],
      [CaseStatus.COMPLETED]: [CaseStatus.ARCHIVED],
      [CaseStatus.ARCHIVED]: []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
  }
}