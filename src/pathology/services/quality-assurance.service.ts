// src/pathology/services/quality-assurance.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { QualityAssurance, QAType, QAStatus, QAOutcome } from '../entities/quality-assurance.entity';
import { PathologyCase } from '../entities/pathology-case.entity';
import { CreateQADto, UpdateQADto, QAFilterDto } from '../dto/quality-assurance.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class QualityAssuranceService {
  constructor(
    @InjectRepository(QualityAssurance)
    private qaRepository: Repository<QualityAssurance>,
    @InjectRepository(PathologyCase)
    private pathologyCaseRepository: Repository<PathologyCase>,
  ) {}

  async create(createDto: CreateQADto): Promise<QualityAssurance> {
    const qaNumber = await this.generateQANumber();
    
    const qa = this.qaRepository.create({
      ...createDto,
      qaNumber,
      status: QAStatus.PENDING,
      initiatedDate: new Date(),
    });

    return await this.qaRepository.save(qa);
  }

  async findAll(filters?: QAFilterDto): Promise<QualityAssurance[]> {
    const query = this.qaRepository.createQueryBuilder('qa')
      .leftJoinAndSelect('qa.pathologyCase', 'pathologyCase')
      .leftJoinAndSelect('qa.initiatedBy', 'initiatedBy')
      .leftJoinAndSelect('qa.reviewer', 'reviewer')
      .leftJoinAndSelect('pathologyCase.patient', 'patient');

    if (filters) {
      if (filters.status) {
        query.andWhere('qa.status = :status', { status: filters.status });
      }
      if (filters.qaType) {
        query.andWhere('qa.qaType = :qaType', { qaType: filters.qaType });
      }
      if (filters.outcome) {
        query.andWhere('qa.outcome = :outcome', { outcome: filters.outcome });
      }
      if (filters.reviewerId) {
        query.andWhere('qa.reviewerId = :reviewerId', { reviewerId: filters.reviewerId });
      }
      if (filters.pathologyCaseId) {
        query.andWhere('qa.pathologyCaseId = :pathologyCaseId', { pathologyCaseId: filters.pathologyCaseId });
      }
      if (filters.dateFrom && filters.dateTo) {
        query.andWhere('qa.initiatedDate BETWEEN :dateFrom AND :dateTo', {
          dateFrom: filters.dateFrom,
          dateTo: filters.dateTo,
        });
      }
    }

    return await query.getMany();
  }

  async findOne(id: string): Promise<QualityAssurance> {
    const qa = await this.qaRepository.findOne({
      where: { id },
      relations: [
        'pathologyCase',
        'pathologyCase.patient',
        'pathologyCase.reports',
        'initiatedBy',
        'reviewer'
      ],
    });

    if (!qa) {
      throw new NotFoundException(`Quality assurance record with ID ${id} not found`);
    }

    return qa;
  }

  async update(id: string, updateDto: UpdateQADto): Promise<QualityAssurance> {
    const qa = await this.findOne(id);
    
    Object.assign(qa, updateDto);

    if (updateDto.status === QAStatus.COMPLETED) {
      qa.completedDate = new Date();
    }

    return await this.qaRepository.save(qa);
  }

  async assignReviewer(id: string, reviewerId: string): Promise<QualityAssurance> {
    const qa = await this.findOne(id);
    qa.reviewer = { id: reviewerId } as any;
    qa.status = QAStatus.IN_REVIEW;
    
    return await this.qaRepository.save(qa);
  }

  async completeReview(id: string, reviewData: any): Promise<QualityAssurance> {
    const qa = await this.findOne(id);
    
    if (qa.status !== QAStatus.IN_REVIEW) {
      throw new BadRequestException('QA record must be in review status to complete');
    }

    Object.assign(qa, reviewData);
    qa.status = QAStatus.COMPLETED;
    qa.completedDate = new Date();

    if (qa.outcome === QAOutcome.MAJOR_DISCORDANT) {
      await this.handleMajorDiscordance(qa);
    }

    return await this.qaRepository.save(qa);
  }

  async initiateRandomReview(): Promise<QualityAssurance[]> {
    const recentCases = await this.pathologyCaseRepository.find({
      where: { status: 'completed' },
      take: 100,
      order: { completedDate: 'DESC' }
    });

    const sampleSize = Math.max(1, Math.floor(recentCases.length * 0.1));
    const selectedCases = this.shuffleArray(recentCases).slice(0, sampleSize);

    const qaRecords = [];
    for (const pathologyCase of selectedCases) {
      const qa = await this.create({
        pathologyCaseId: pathologyCase.id,
        qaType: QAType.RANDOM_REVIEW,
        reason: 'Routine random quality assurance review',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
      qaRecords.push(qa);
    }

    return qaRecords;
  }

  async initiatePeerReview(caseId: string, reason: string, reviewerId?: string): Promise<QualityAssurance> {
    const qa = await this.create({
      pathologyCaseId: caseId,
      qaType: QAType.PEER_REVIEW,
      reason,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    });

    if (reviewerId) {
      await this.assignReviewer(qa.id, reviewerId);
    }

    return qa;
  }

  async getOverdueReviews(): Promise<QualityAssurance[]> {
    const currentDate = new Date();
    
    return await this.qaRepository.find({
      where: {
        status: In([QAStatus.PENDING, QAStatus.IN_REVIEW]),
        dueDate: In([undefined, null])
      },
      relations: ['pathologyCase', 'reviewer']
    });
  }

  async getQAMetrics(dateFrom?: Date, dateTo?: Date): Promise<any> {
    const query = this.qaRepository.createQueryBuilder('qa');
    
    if (dateFrom && dateTo) {
      query.where('qa.initiatedDate BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo
      });
    }

    const totalReviews = await query.getCount();
    const completedReviews = await query.clone().andWhere('qa.status = :status', { status: QAStatus.COMPLETED }).getCount();
    const pendingReviews = await query.clone().andWhere('qa.status = :status', { status: QAStatus.PENDING }).getCount();
    const overdueReviews = await query.clone()
      .andWhere('qa.status IN (:...statuses)', { statuses: [QAStatus.PENDING, QAStatus.IN_REVIEW] })
      .andWhere('qa.dueDate < :currentDate', { currentDate: new Date() })
      .getCount();

    const outcomeDistribution = await this.qaRepository
      .createQueryBuilder('qa')
      .select('qa.outcome', 'outcome')
      .addSelect('COUNT(*)', 'count')
      .where('qa.outcome IS NOT NULL')
      .groupBy('qa.outcome')
      .getRawMany();

    const concordanceRate = await this.calculateConcordanceRate(dateFrom, dateTo);
    const averageTurnaroundTime = await this.calculateAverageTurnaroundTime(dateFrom, dateTo);
    const majorDiscordanceRate = await this.calculateConcordanceRate(dateFrom, dateTo);

    return {
      totalReviews,
      completedReviews,
      pendingReviews,
      overdueReviews,
      outcomeDistribution,
      concordanceRate,
      averageTurnaroundTime,
      majorDiscordanceRate
    };
  }
    calculateAverageTurnaroundTime(dateFrom: Date | undefined, dateTo: Date | undefined) {
        throw new Error('Method not implemented.');
    }

  async getPathologistPerformance(pathologistId: string, dateFrom?: Date, dateTo?: Date): Promise<any> {
    const query = this.qaRepository.createQueryBuilder('qa')
      .leftJoinAndSelect('qa.pathologyCase', 'pathologyCase')
      .where('pathologyCase.pathologistId = :pathologistId', { pathologistId });

    if (dateFrom && dateTo) {
      query.andWhere('qa.initiatedDate BETWEEN :dateFrom AND :dateTo', {
        dateFrom,
        dateTo
      });
    }

    const reviews = await query.getMany();
    const totalReviews = reviews.length;
    const concordantReviews = reviews.filter(qa => qa.outcome === QAOutcome.CONCORDANT).length;
    const majorDiscordantReviews = reviews.filter(qa => qa.outcome === QAOutcome.MAJOR_DISCORDANT).length;

    const concordanceRate = totalReviews > 0 ? (concordantReviews / totalReviews) * 100 : 0;
    const majorDiscordanceRate = totalReviews > 0 ? (majorDiscordantReviews / totalReviews) * 100 : 0;

    return {
      pathologistId,
      totalReviews,
      concordantReviews,
      majorDiscordantReviews,
      concordanceRate,
      majorDiscordanceRate,
      reviews
    };
  }

  @Cron(CronExpression.EVERY_WEEK)
  async automaticRandomReview(): Promise<void> {
    await this.initiateRandomReview();
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendOverdueNotifications(): Promise<void> {
    const overdueReviews = await this.getOverdueReviews();
  }

  private async generateQANumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.qaRepository.count();
    return `QA-${year}-${String(count + 1).padStart(6, '0')}`;
  }

  private async handleMajorDiscordance(qa: QualityAssurance): Promise<void> {
    const correctiveActions = [
      {
        action: 'Schedule additional training session',
        assignedTo: qa.pathologyCase.pathologist?.id || '',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        completed: false,
        completedDate: null
      },
      {
        action: 'Review similar cases for pattern analysis',
        assignedTo: qa.reviewer?.id || '',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        completed: false,
        completedDate: null
      }
    ];

    qa.correctiveActions = correctiveActions;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private async calculateConcordanceRate(dateFrom?: