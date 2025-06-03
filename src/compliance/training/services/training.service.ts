import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  TrainingProgram,
  ProgramStatus,
} from '../entities/training-program.entity';
import {
  TrainingRecord,
  TrainingStatus,
} from '../entities/training-record.entity';
import {
  CompetencyAssessment,
  CompetencyLevel,
} from '../entities/competency-assessment.entity';
import { CreateTrainingProgramDto } from '../../dto/create-training-program.dto';
import { TrainingMetricsDto } from '../../dto/compliance-dashboard.dto';
import { NotificationService } from '../../services/notification.service';
import { AuditService } from '../../services/audit.service';

@Injectable()
export class TrainingService {
  private readonly logger = new Logger(TrainingService.name);

  constructor(
    @InjectRepository(TrainingProgram)
    private readonly programRepository: Repository<TrainingProgram>,
    @InjectRepository(TrainingRecord)
    private readonly recordRepository: Repository<TrainingRecord>,
    @InjectRepository(CompetencyAssessment)
    private readonly competencyRepository: Repository<CompetencyAssessment>,
    private readonly notificationService: NotificationService,
    private readonly auditService: AuditService,
  ) {}

  async createTrainingProgram(
    createProgramDto: CreateTrainingProgramDto,
    createdBy: number,
  ): Promise<TrainingProgram> {
    this.logger.log(`Creating training program: ${createProgramDto.code}`);

    const existingProgram = await this.programRepository.findOne({
      where: { code: createProgramDto.code },
    });

    if (existingProgram) {
      throw new BadRequestException(
        `Training program with code ${createProgramDto.code} already exists`,
      );
    }

    const program = this.programRepository.create({
      ...createProgramDto,
      createdBy,
    });

    const savedProgram = await this.programRepository.save(program);

    await this.auditService.log({
      eventType: 'MODIFICATION',
      severity: 'MEDIUM',
      resourceType: 'training_program',
      resourceId: savedProgram.id.toString(),
      description: `Created training program: ${savedProgram.code}`,
      userId: createdBy,
    });

    return savedProgram;
  }

  async assignTrainingToEmployee(
    employeeId: number,
    programId: number,
    assignedBy: number,
    dueDate?: Date,
  ): Promise<TrainingRecord> {
    this.logger.log(
      `Assigning training program ${programId} to employee ${employeeId}`,
    );

    const program = await this.programRepository.findOne({
      where: { id: programId, status: ProgramStatus.ACTIVE },
    });

    if (!program) {
      throw new NotFoundException('Training program not found or inactive');
    }

    // Check if already assigned
    const existingRecord = await this.recordRepository.findOne({
      where: {
        employeeId,
        programId,
        status: In([TrainingStatus.NOT_STARTED, TrainingStatus.IN_PROGRESS]),
      },
    });

    if (existingRecord) {
      throw new BadRequestException(
        'Training already assigned to this employee',
      );
    }

    const defaultDueDate = new Date();
    defaultDueDate.setDate(defaultDueDate.getDate() + 30); // 30 days default

    const record = this.recordRepository.create({
      employeeId,
      programId,
      assignedDate: new Date(),
      dueDate: dueDate || defaultDueDate,
      status: TrainingStatus.NOT_STARTED,
    });

    const savedRecord = await this.recordRepository.save(record);

    // Send assignment notification
    await this.notificationService.sendTrainingAssignmentNotification(
      savedRecord,
      program,
    );

    await this.auditService.log({
      eventType: 'MODIFICATION',
      severity: 'LOW',
      resourceType: 'training_record',
      resourceId: savedRecord.id.toString(),
      description: `Assigned training ${program.code} to employee ${employeeId}`,
      userId: assignedBy,
    });

    return savedRecord;
  }

  async completeTraining(
    recordId: number,
    completionData: {
      score: number;
      timeSpentHours: number;
      instructorId?: number;
      notes?: string;
    },
  ): Promise<TrainingRecord> {
    this.logger.log(`Completing training record: ${recordId}`);

    const record = await this.recordRepository.findOne({
      where: { id: recordId },
      relations: ['program'],
    });

    if (!record) {
      throw new NotFoundException('Training record not found');
    }

    if (record.status === TrainingStatus.COMPLETED) {
      throw new BadRequestException('Training already completed');
    }

    const passed = completionData.score >= record.program.passingScore;

    record.status = passed ? TrainingStatus.COMPLETED : TrainingStatus.FAILED;
    record.completionDate = new Date();
    record.score = completionData.score;
    record.timeSpentHours = completionData.timeSpentHours;
    record.instructorId = completionData.instructorId;
    record.notes = completionData.notes;
    record.attempts += 1;

    // Set expiration date if recertification is required
    if (
      passed &&
      record.program.recertificationRequired &&
      record.program.recertificationPeriodMonths
    ) {
      const expirationDate = new Date();
      expirationDate.setMonth(
        expirationDate.getMonth() + record.program.recertificationPeriodMonths,
      );
      record.expirationDate = expirationDate;
    }

    // Generate certificate if passed
    if (passed) {
      record.certificateIssued = true;
      record.certificateNumber = this.generateCertificateNumber(record);
    }

    const savedRecord = await this.recordRepository.save(record);

    // Send completion notification
    await this.notificationService.sendTrainingCompletionNotification(
      savedRecord,
      passed,
    );

    await this.auditService.log({
      eventType: 'MODIFICATION',
      severity: 'LOW',
      resourceType: 'training_record',
      resourceId: savedRecord.id.toString(),
      description: `Training ${passed ? 'completed' : 'failed'}: score ${completionData.score}%`,
      userId: record.employeeId,
    });

    return savedRecord;
  }

  async createCompetencyAssessment(assessmentData: {
    employeeId: number;
    programId: number;
    competencyType: string;
    assessmentMethod: string;
    score: number;
    maximumScore: number;
    assessorId: number;
    strengths?: string;
    improvementAreas?: string;
    developmentPlan?: string;
  }): Promise<CompetencyAssessment> {
    this.logger.log(
      `Creating competency assessment for employee ${assessmentData.employeeId}`,
    );

    const program = await this.programRepository.findOne({
      where: { id: assessmentData.programId },
    });

    if (!program) {
      throw new NotFoundException('Training program not found');
    }

    const competencyAchieved =
      assessmentData.score / assessmentData.maximumScore >= 0.8; // 80% threshold
    const competencyLevel = this.determineCompetencyLevel(
      assessmentData.score / assessmentData.maximumScore,
    );

    const assessment = this.competencyRepository.create({
      ...assessmentData,
      assessmentDate: new Date(),
      competencyLevel,
      competencyAchieved,
      nextAssessmentDate: this.calculateNextAssessmentDate(competencyLevel),
    });

    const savedAssessment = await this.competencyRepository.save(assessment);

    await this.auditService.log({
      eventType: 'MODIFICATION',
      severity: 'LOW',
      resourceType: 'competency_assessment',
      resourceId: savedAssessment.id.toString(),
      description: `Competency assessment completed: ${competencyLevel}`,
      userId: assessmentData.assessorId,
    });

    return savedAssessment;
  }

  async getTrainingMetrics(): Promise<TrainingMetricsDto> {
    this.logger.log('Calculating training metrics');

    const now = new Date();

    const [
      totalEmployees,
      currentlyTrained,
      expiredTraining,
      overdueTraining,
      averageCompetencyScore,
    ] = await Promise.all([
      this.getUniqueEmployeeCount(),
      this.recordRepository.count({
        where: {
          status: TrainingStatus.COMPLETED,
          expirationDate: null, // Never expires
        },
      }),
      this.recordRepository.count({
        where: {
          status: TrainingStatus.EXPIRED,
        },
      }),
      this.recordRepository.count({
        where: {
          status: In([TrainingStatus.NOT_STARTED, TrainingStatus.IN_PROGRESS]),
          dueDate: LessThan(now),
        },
      }),
      this.getAverageCompetencyScore(),
    ]);

    // Also count currently trained with non-expired certifications
    const currentlyTrainedWithExpiration = await this.recordRepository.count({
      where: {
        status: TrainingStatus.COMPLETED,
        expirationDate: LessThan(now), // Not yet expired
      },
    });

    const totalCurrentlyTrained =
      currentlyTrained + currentlyTrainedWithExpiration;
    const completionRate =
      totalEmployees > 0 ? (totalCurrentlyTrained / totalEmployees) * 100 : 0;

    return {
      completionRate: Math.round(completionRate * 100) / 100,
      currentlyTrained: totalCurrentlyTrained,
      expiredTraining,
      overdueTraining,
      averageCompetencyScore,
    };
  }

  async getEmployeeTrainingStatus(employeeId: number): Promise<any> {
    const trainingRecords = await this.recordRepository.find({
      where: { employeeId },
      relations: ['program'],
      order: { assignedDate: 'DESC' },
    });

    const competencyAssessments = await this.competencyRepository.find({
      where: { employeeId },
      relations: ['program'],
      order: { assessmentDate: 'DESC' },
    });

    // Group training by status
    const statusCounts = trainingRecords.reduce(
      (acc, record) => {
        acc[record.status] = (acc[record.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Find expiring certifications (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringCertifications = trainingRecords.filter(
      (record) =>
        record.expirationDate &&
        record.expirationDate <= thirtyDaysFromNow &&
        record.status === TrainingStatus.COMPLETED,
    );

    return {
      employeeId,
      trainingRecords,
      competencyAssessments,
      statusCounts,
      expiringCertifications,
      totalTraining: trainingRecords.length,
      completedTraining: statusCounts[TrainingStatus.COMPLETED] || 0,
      pendingTraining:
        (statusCounts[TrainingStatus.NOT_STARTED] || 0) +
        (statusCounts[TrainingStatus.IN_PROGRESS] || 0),
    };
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkExpiringTraining(): Promise<void> {
    this.logger.log('Checking for expiring training certifications');

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringRecords = await this.recordRepository.find({
      where: {
        status: TrainingStatus.COMPLETED,
        expirationDate: LessThan(thirtyDaysFromNow),
      },
      relations: ['program'],
    });

    for (const record of expiringRecords) {
      await this.notificationService.sendExpiringTrainingNotification(record);
    }

    this.logger.log(
      `Processed ${expiringRecords.length} expiring training records`,
    );
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async updateExpiredTraining(): Promise<void> {
    this.logger.log('Updating expired training records');

    const expiredRecords = await this.recordRepository.find({
      where: {
        status: TrainingStatus.COMPLETED,
        expirationDate: LessThan(new Date()),
      },
    });

    for (const record of expiredRecords) {
      record.status = TrainingStatus.EXPIRED;
      await this.recordRepository.save(record);

      // Automatically reassign if mandatory
      const program = await this.programRepository.findOne({
        where: { id: record.programId },
      });

      if (program?.mandatory) {
        await this.assignTrainingToEmployee(
          record.employeeId,
          record.programId,
          1, // System user
        );
      }
    }

    this.logger.log(
      `Updated ${expiredRecords.length} expired training records`,
    );
  }

  private async getUniqueEmployeeCount(): Promise<number> {
    const result = await this.recordRepository
      .createQueryBuilder('record')
      .select('COUNT(DISTINCT record.employeeId)', 'count')
      .getRawOne();

    return parseInt(result?.count || '0');
  }

  private async getAverageCompetencyScore(): Promise<number> {
    const result = await this.competencyRepository
      .createQueryBuilder('assessment')
      .select('AVG(assessment.score)', 'avgScore')
      .where('assessment.assessmentDate > :recentDate', {
        recentDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
      })
      .getRawOne();

    return result?.avgScore ? Math.round(result.avgScore * 100) / 100 : 0;
  }

  private determineCompetencyLevel(scoreRatio: number): CompetencyLevel {
    if (scoreRatio >= 0.9) return CompetencyLevel.EXPERT;
    if (scoreRatio >= 0.8) return CompetencyLevel.PROFICIENT;
    if (scoreRatio >= 0.7) return CompetencyLevel.COMPETENT;
    return CompetencyLevel.NOVICE;
  }

  private calculateNextAssessmentDate(level: CompetencyLevel): Date {
    const nextDate = new Date();

    switch (level) {
      case CompetencyLevel.EXPERT:
        nextDate.setFullYear(nextDate.getFullYear() + 2); // 2 years
        break;
      case CompetencyLevel.PROFICIENT:
        nextDate.setFullYear(nextDate.getFullYear() + 1); // 1 year
        break;
      case CompetencyLevel.COMPETENT:
        nextDate.setMonth(nextDate.getMonth() + 6); // 6 months
        break;
      case CompetencyLevel.NOVICE:
        nextDate.setMonth(nextDate.getMonth() + 3); // 3 months
        break;
    }

    return nextDate;
  }

  private generateCertificateNumber(record: TrainingRecord): string {
    const year = new Date().getFullYear();
    const programCode = record.programId.toString().padStart(3, '0');
    const employeeCode = record.employeeId.toString().padStart(5, '0');
    const sequence = Date.now().toString().slice(-4);

    return `CERT-${year}-${programCode}-${employeeCode}-${sequence}`;
  }
}
