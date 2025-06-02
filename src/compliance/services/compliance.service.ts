// src/compliance/services/compliance.service.ts
import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan, MoreThan, In, DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Regulation, RegulationType, RegulationStatus } from '../entities/regulation.entity';
import { ComplianceRequirement, RiskLevel } from '../entities/compliance-requirement.entity';
import { ComplianceAssessment, AssessmentStatus, ComplianceScore } from '../entities/compliance-assessment.entity';
import { Finding, FindingStatus, FindingSeverity } from '../entities/finding.entity';
import { CorrectiveAction, ActionStatus } from '../entities/corrective-action.entity';
import { PolicyProcedure, PolicyStatus } from '../entities/policy-procedure.entity';
import { CreateRegulationDto } from '../dto/create-regulation.dto';
import { CreateComplianceRequirementDto } from '../dto/create-compliance-requirement.dto';
import { CreateComplianceAssessmentDto } from '../dto/create-compliance-assessment.dto';
import { ComplianceMetricsDto } from '../dto/compliance-dashboard.dto';
import { NotificationService } from './notification.service';
import { AuditService } from './audit.service';

@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  constructor(
    @InjectRepository(Regulation)
    private readonly regulationRepository: Repository<Regulation>,
    @InjectRepository(ComplianceRequirement)
    private readonly requirementRepository: Repository<ComplianceRequirement>,
    @InjectRepository(ComplianceAssessment)
    private readonly assessmentRepository: Repository<ComplianceAssessment>,
    @InjectRepository(Finding)
    private readonly findingRepository: Repository<Finding>,
    @InjectRepository(CorrectiveAction)
    private readonly correctiveActionRepository: Repository<CorrectiveAction>,
    @InjectRepository(PolicyProcedure)
    private readonly policyRepository: Repository<PolicyProcedure>,
    private readonly notificationService: NotificationService,
    private readonly auditService: AuditService,
    private readonly dataSource: DataSource,
  ) {}

  // ==================== REGULATION MANAGEMENT ====================

  async createRegulation(createRegulationDto: CreateRegulationDto, createdBy: number): Promise<Regulation> {
    this.logger.log(`Creating regulation: ${createRegulationDto.code}`);

    const existingRegulation = await this.regulationRepository.findOne({
      where: { code: createRegulationDto.code },
    });

    if (existingRegulation) {
      throw new BadRequestException(`Regulation with code ${createRegulationDto.code} already exists`);
    }

    const regulation = this.regulationRepository.create({
      ...createRegulationDto,
      effectiveDate: new Date(createRegulationDto.effectiveDate),
      expirationDate: createRegulationDto.expirationDate ? new Date(createRegulationDto.expirationDate) : null,
      lastUpdatedBy: createdBy,
    });

    const savedRegulation = await this.regulationRepository.save(regulation);

    await this.auditService.log({
      eventType: 'MODIFICATION',
      severity: 'MEDIUM',
      resourceType: 'regulation',
      resourceId: savedRegulation.id.toString(),
      description: `Created regulation: ${savedRegulation.code}`,
      userId: createdBy,
    });

    return savedRegulation;
  }

  async updateRegulation(
    id: number, 
    updateData: Partial<CreateRegulationDto>, 
    updatedBy: number
  ): Promise<Regulation> {
    const regulation = await this.regulationRepository.findOne({ where: { id } });
    
    if (!regulation) {
      throw new NotFoundException('Regulation not found');
    }

    const oldData = { ...regulation };
    
    Object.assign(regulation, {
      ...updateData,
      effectiveDate: updateData.effectiveDate ? new Date(updateData.effectiveDate) : regulation.effectiveDate,
      expirationDate: updateData.expirationDate ? new Date(updateData.expirationDate) : regulation.expirationDate,
      lastUpdatedBy: updatedBy,
    });

    const savedRegulation = await this.regulationRepository.save(regulation);

    await this.auditService.log({
      eventType: 'MODIFICATION',
      severity: 'MEDIUM',
      resourceType: 'regulation',
      resourceId: savedRegulation.id.toString(),
      description: `Updated regulation: ${savedRegulation.code}`,
      userId: updatedBy,
      metadata: { oldData, newData: savedRegulation },
    });

    return savedRegulation;
  }

  async getRegulations(filters?: {
    type?: RegulationType;
    status?: RegulationStatus;
    effectiveBefore?: Date;
    effectiveAfter?: Date;
  }): Promise<Regulation[]> {
    const queryBuilder = this.regulationRepository.createQueryBuilder('regulation');

    if (filters?.type) {
      queryBuilder.andWhere('regulation.type = :type', { type: filters.type });
    }

    if (filters?.status) {
      queryBuilder.andWhere('regulation.status = :status', { status: filters.status });
    }

    if (filters?.effectiveBefore) {
      queryBuilder.andWhere('regulation.effectiveDate <= :before', { before: filters.effectiveBefore });
    }

    if (filters?.effectiveAfter) {
      queryBuilder.andWhere('regulation.effectiveDate >= :after', { after: filters.effectiveAfter });
    }

    return queryBuilder
      .orderBy('regulation.effectiveDate', 'DESC')
      .getMany();
  }

  async getRegulationById(id: number): Promise<Regulation> {
    const regulation = await this.regulationRepository.findOne({
      where: { id },
      relations: ['requirements', 'auditLogs'],
    });

    if (!regulation) {
      throw new NotFoundException('Regulation not found');
    }

    return regulation;
  }

  // ==================== COMPLIANCE REQUIREMENT MANAGEMENT ====================

  async createComplianceRequirement(
    createRequirementDto: CreateComplianceRequirementDto,
    createdBy: number,
  ): Promise<ComplianceRequirement> {
    this.logger.log(`Creating compliance requirement: ${createRequirementDto.code}`);

    const regulation = await this.regulationRepository.findOne({
      where: { id: createRequirementDto.regulationId },
    });

    if (!regulation) {
      throw new NotFoundException('Regulation not found');
    }

    const existingRequirement = await this.requirementRepository.findOne({
      where: { code: createRequirementDto.code },
    });

    if (existingRequirement) {
      throw new BadRequestException(`Requirement with code ${createRequirementDto.code} already exists`);
    }

    const nextAssessmentDue = new Date();
    nextAssessmentDue.setDate(nextAssessmentDue.getDate() + createRequirementDto.assessmentFrequencyDays);

    const requirement = this.requirementRepository.create({
      ...createRequirementDto,
      nextAssessmentDue,
    });

    const savedRequirement = await this.requirementRepository.save(requirement);

    await this.auditService.log({
      eventType: 'MODIFICATION',
      severity: 'MEDIUM',
      resourceType: 'compliance_requirement',
      resourceId: savedRequirement.id.toString(),
      regulationId: regulation.id,
      description: `Created compliance requirement: ${savedRequirement.code}`,
      userId: createdBy,
    });

    return savedRequirement;
  }

  async updateComplianceRequirement(
    id: number,
    updateData: Partial<CreateComplianceRequirementDto>,
    updatedBy: number,
  ): Promise<ComplianceRequirement> {
    const requirement = await this.requirementRepository.findOne({
      where: { id },
      relations: ['regulation'],
    });

    if (!requirement) {
      throw new NotFoundException('Compliance requirement not found');
    }

    const oldData = { ...requirement };
    Object.assign(requirement, updateData);

    // Recalculate next assessment due if frequency changed
    if (updateData.assessmentFrequencyDays) {
      const nextDue = new Date();
      nextDue.setDate(nextDue.getDate() + updateData.assessmentFrequencyDays);
      requirement.nextAssessmentDue = nextDue;
    }

    const savedRequirement = await this.requirementRepository.save(requirement);

    await this.auditService.log({
      eventType: 'MODIFICATION',
      severity: 'MEDIUM',
      resourceType: 'compliance_requirement',
      resourceId: savedRequirement.id.toString(),
      regulationId: requirement.regulation.id,
      description: `Updated compliance requirement: ${savedRequirement.code}`,
      userId: updatedBy,
      metadata: { oldData, newData: savedRequirement },
    });

    return savedRequirement;
  }

  async getComplianceRequirements(filters?: {
    regulationId?: number;
    riskLevel?: RiskLevel;
    active?: boolean;
    dueBefore?: Date;
  }): Promise<ComplianceRequirement[]> {
    const queryBuilder = this.requirementRepository
      .createQueryBuilder('requirement')
      .leftJoinAndSelect('requirement.regulation', 'regulation');

    if (filters?.regulationId) {
      queryBuilder.andWhere('requirement.regulationId = :regulationId', { 
        regulationId: filters.regulationId 
      });
    }

    if (filters?.riskLevel) {
      queryBuilder.andWhere('requirement.riskLevel = :riskLevel', { 
        riskLevel: filters.riskLevel 
      });
    }

    if (filters?.active !== undefined) {
      queryBuilder.andWhere('requirement.active = :active', { 
        active: filters.active 
      });
    }

    if (filters?.dueBefore) {
      queryBuilder.andWhere('requirement.nextAssessmentDue <= :dueBefore', { 
        dueBefore: filters.dueBefore 
      });
    }

    return queryBuilder
      .orderBy('requirement.riskLevel', 'ASC')
      .addOrderBy('requirement.nextAssessmentDue', 'ASC')
      .getMany();
  }

  // ==================== COMPLIANCE ASSESSMENT MANAGEMENT ====================

  async createComplianceAssessment(
    createAssessmentDto: CreateComplianceAssessmentDto,
  ): Promise<ComplianceAssessment> {
    this.logger.log(`Creating compliance assessment for requirement: ${createAssessmentDto.requirementId}`);

    const requirement = await this.requirementRepository.findOne({
      where: { id: createAssessmentDto.requirementId },
      relations: ['regulation'],
    });

    if (!requirement) {
      throw new NotFoundException('Compliance requirement not found');
    }

    const assessment = this.assessmentRepository.create({
      ...createAssessmentDto,
      assessmentDate: new Date(createAssessmentDto.assessmentDate),
      dueDate: new Date(createAssessmentDto.dueDate),
      remediationDeadline: createAssessmentDto.remediationDeadline 
        ? new Date(createAssessmentDto.remediationDeadline) 
        : null,
    });

    const savedAssessment = await this.assessmentRepository.save(assessment);

    // Update next assessment due date for the requirement if completed
    if (savedAssessment.status === AssessmentStatus.COMPLETED) {
      await this.updateNextAssessmentDue(requirement);
    }

    await this.auditService.log({
      eventType: 'MODIFICATION',
      severity: 'LOW',
      resourceType: 'compliance_assessment',
      resourceId: savedAssessment.id.toString(),
      regulationId: requirement.regulation.id,
      description: `Created compliance assessment for requirement: ${requirement.code}`,
      userId: createAssessmentDto.assessedBy,
    });

    return savedAssessment;
  }

  async updateAssessmentScore(
    id: number,
    score: ComplianceScore,
    scorePercentage?: number,
    notes?: string,
    evidence?: string,
    reviewedBy?: number,
  ): Promise<ComplianceAssessment> {
    const assessment = await this.assessmentRepository.findOne({
      where: { id },
      relations: ['requirement', 'requirement.regulation'],
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    const oldScore = assessment.score;
    assessment.score = score;
    assessment.scorePercentage = scorePercentage;
    assessment.notes = notes;
    assessment.evidence = evidence;
    assessment.reviewedBy = reviewedBy;
    assessment.status = AssessmentStatus.COMPLETED;

    // Determine if remediation is required
    assessment.remediationRequired = score === ComplianceScore.NON_COMPLIANT || 
                                   score === ComplianceScore.PARTIALLY_COMPLIANT;

    if (assessment.remediationRequired && !assessment.remediationDeadline) {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + 30); // 30 days default
      assessment.remediationDeadline = deadline;
    }

    const savedAssessment = await this.assessmentRepository.save(assessment);

    // Create findings for non-compliant assessments
    if (score === ComplianceScore.NON_COMPLIANT) {
      await this.createFindingFromAssessment(savedAssessment);
    }

    // Update next assessment due
    await this.updateNextAssessmentDue(assessment.requirement);

    await this.auditService.log({
      eventType: 'MODIFICATION',
      severity: score === ComplianceScore.NON_COMPLIANT ? 'HIGH' : 'MEDIUM',
      resourceType: 'compliance_assessment',
      resourceId: savedAssessment.id.toString(),
      regulationId: assessment.requirement.regulation.id,
      description: `Assessment scored: ${score} (was: ${oldScore})`,
      userId: reviewedBy || assessment.assessedBy,
    });

    return savedAssessment;
  }

  async getAssessments(filters?: {
    requirementId?: number;
    status?: AssessmentStatus;
    score?: ComplianceScore;
    dueBefore?: Date;
    dueAfter?: Date;
  }): Promise<ComplianceAssessment[]> {
    const queryBuilder = this.assessmentRepository
      .createQueryBuilder('assessment')
      .leftJoinAndSelect('assessment.requirement', 'requirement')
      .leftJoinAndSelect('requirement.regulation', 'regulation');

    if (filters?.requirementId) {
      queryBuilder.andWhere('assessment.requirementId = :requirementId', { 
        requirementId: filters.requirementId 
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('assessment.status = :status', { 
        status: filters.status 
      });
    }

    if (filters?.score) {
      queryBuilder.andWhere('assessment.score = :score', { 
        score: filters.score 
      });
    }

    if (filters?.dueBefore) {
      queryBuilder.andWhere('assessment.dueDate <= :dueBefore', { 
        dueBefore: filters.dueBefore 
      });
    }

    if (filters?.dueAfter) {
      queryBuilder.andWhere('assessment.dueDate >= :dueAfter', { 
        dueAfter: filters.dueAfter 
      });
    }

    return queryBuilder
      .orderBy('assessment.dueDate', 'ASC')
      .getMany();
  }

  // ==================== FINDINGS MANAGEMENT ====================

  async createFindingFromAssessment(assessment: ComplianceAssessment): Promise<Finding> {
    const finding = this.findingRepository.create({
      assessmentId: assessment.id,
      title: `Non-compliance identified in ${assessment.requirement?.code}`,
      description: `Assessment revealed non-compliance requiring immediate attention`,
      severity: this.determineFindingSeverity(assessment.requirement?.riskLevel),
      identifiedDate: new Date(),
      dueDate: assessment.remediationDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      identifiedBy: assessment.reviewedBy || assessment.assessedBy,
      status: FindingStatus.OPEN,
    });

    const savedFinding = await this.findingRepository.save(finding);

    await this.auditService.log({
      eventType: 'MODIFICATION',
      severity: 'HIGH',
      resourceType: 'finding',
      resourceId: savedFinding.id.toString(),
      description: `Finding created from non-compliant assessment`,
      userId: assessment.reviewedBy || assessment.assessedBy,
    });

    // Send notification for critical findings
    if (savedFinding.severity === FindingSeverity.CRITICAL) {
      await this.notificationService.sendCriticalFindingAlert(savedFinding);
    }

    return savedFinding;
  }

  async updateFindingStatus(
    id: number,
    status: FindingStatus,
    notes?: string,
    updatedBy?: number,
  ): Promise<Finding> {
    const finding = await this.findingRepository.findOne({
      where: { id },
      relations: ['assessment', 'correctiveActions'],
    });

    if (!finding) {
      throw new NotFoundException('Finding not found');
    }

    const oldStatus = finding.status;
    finding.status = status;

    if (status === FindingStatus.RESOLVED || status === FindingStatus.CLOSED) {
      finding.resolvedDate = new Date();
    }

    const savedFinding = await this.findingRepository.save(finding);

    await this.auditService.log({
      eventType: 'MODIFICATION',
      severity: 'MEDIUM',
      resourceType: 'finding',
      resourceId: savedFinding.id.toString(),
      description: `Finding status changed: ${oldStatus} → ${status}`,
      userId: updatedBy,
      metadata: { notes },
    });

    return savedFinding;
  }

  async getFindings(filters?: {
    severity?: FindingSeverity;
    status?: FindingStatus;
    assignedTo?: number;
    dueBefore?: Date;
  }): Promise<Finding[]> {
    const queryBuilder = this.findingRepository
      .createQueryBuilder('finding')
      .leftJoinAndSelect('finding.assessment', 'assessment')
      .leftJoinAndSelect('assessment.requirement', 'requirement')
      .leftJoinAndSelect('finding.correctiveActions', 'actions');

    if (filters?.severity) {
      queryBuilder.andWhere('finding.severity = :severity', { 
        severity: filters.severity 
      });
    }

    if (filters?.status) {
      queryBuilder.andWhere('finding.status = :status', { 
        status: filters.status 
      });
    }

    if (filters?.assignedTo) {
      queryBuilder.andWhere('finding.assignedTo = :assignedTo', { 
        assignedTo: filters.assignedTo 
      });
    }

    if (filters?.dueBefore) {
      queryBuilder.andWhere('finding.dueDate <= :dueBefore', { 
        dueBefore: filters.dueBefore 
      });
    }

    return queryBuilder
      .orderBy('finding.severity', 'ASC')
      .addOrderBy('finding.dueDate', 'ASC')
      .getMany();
  }

  // ==================== METRICS AND DASHBOARD ====================

  async getComplianceMetrics(): Promise<ComplianceMetricsDto> {
    this.logger.log('Calculating compliance metrics');

    const [
      totalRequirements,
      compliantAssessments,
      nonCompliantAssessments,
      pendingAssessments,
      overdueAssessments,
      openFindings,
      criticalFindings,
    ] = await Promise.all([
      this.requirementRepository.count({ where: { active: true } }),
      this.getLatestAssessmentsByScore(ComplianceScore.COMPLIANT),
      this.getLatestAssessmentsByScore(ComplianceScore.NON_COMPLIANT),
      this.assessmentRepository.count({ where: { status: AssessmentStatus.SCHEDULED } }),
      this.assessmentRepository.count({
        where: {
          status: In([AssessmentStatus.SCHEDULED, AssessmentStatus.IN_PROGRESS]),
          dueDate: LessThan(new Date()),
        },
      }),
      this.findingRepository.count({ 
        where: { status: In([FindingStatus.OPEN, FindingStatus.IN_PROGRESS]) } 
      }),
      this.findingRepository.count({
        where: {
          status: In([FindingStatus.OPEN, FindingStatus.IN_PROGRESS]),
          severity: FindingSeverity.CRITICAL,
        },
      }),
    ]);

    const compliantCount = compliantAssessments.length;
    const nonCompliantCount = nonCompliantAssessments.length;
    const assessedRequirements = compliantCount + nonCompliantCount;
    const overallComplianceRate = assessedRequirements > 0 
      ? (compliantCount / assessedRequirements) * 100 
      : 0;

    return {
      overallComplianceRate: Math.round(overallComplianceRate * 100) / 100,
      compliantCount,
      nonCompliantCount,
      pendingAssessments,
      overdueAssessments,
      openFindings,
      criticalFindings,
    };
  }

  async getRegulationCompliance(regulationType: RegulationType): Promise<any> {
    const regulations = await this.regulationRepository.find({
      where: { type: regulationType, status: RegulationStatus.ACTIVE },
      relations: ['requirements'],
    });

    const complianceData = await Promise.all(
      regulations.map(async (regulation) => {
        const requirements = regulation.requirements.filter(req => req.active);
        const latestAssessments = await this.getLatestAssessmentsForRequirements(
          requirements.map(req => req.id),
        );

        const compliant = latestAssessments.filter(
          assessment => assessment.score === ComplianceScore.COMPLIANT,
        ).length;

        const total = latestAssessments.length;
        const complianceRate = total > 0 ? (compliant / total) * 100 : 0;

        return {
          regulation: {
            id: regulation.id,
            code: regulation.code,
            title: regulation.title,
            type: regulation.type,
          },
          requirementsCount: requirements.length,
          assessedRequirements: total,
          compliantRequirements: compliant,
          complianceRate: Math.round(complianceRate * 100) / 100,
        };
      }),
    );

    return complianceData;
  }

  async getOverdueAssessments(): Promise<ComplianceAssessment[]> {
    return this.assessmentRepository.find({
      where: {
        status: In([AssessmentStatus.SCHEDULED, AssessmentStatus.IN_PROGRESS]),
        dueDate: LessThan(new Date()),
      },
      relations: ['requirement', 'requirement.regulation'],
      order: { dueDate: 'ASC' },
    });
  }

  async getHighRiskFindings(): Promise<Finding[]> {
    return this.findingRepository.find({
      where: {
        status: In([FindingStatus.OPEN, FindingStatus.IN_PROGRESS]),
        severity: In([FindingSeverity.CRITICAL, FindingSeverity.HIGH]),
      },
      relations: ['assessment', 'assessment.requirement', 'correctiveActions'],
      order: { identifiedDate: 'DESC' },
    });
  }

  // ==================== SCHEDULED TASKS ====================

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async scheduleOverdueAssessmentNotifications(): Promise<void> {
    this.logger.log('Checking for overdue assessments');

    const overdueAssessments = await this.getOverdueAssessments();

    for (const assessment of overdueAssessments) {
      await this.notificationService.sendOverdueAssessmentNotification(assessment);
      
      // Update status to overdue
      assessment.status = AssessmentStatus.OVERDUE;
      await this.assessmentRepository.save(assessment);
    }

    this.logger.log(`Processed ${overdueAssessments.length} overdue assessments`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async scheduleUpcomingAssessments(): Promise<void> {
    this.logger.log('Scheduling upcoming assessments');

    const upcomingDue = new Date();
    upcomingDue.setDate(upcomingDue.getDate() + 7); // 7 days ahead

    const requirements = await this.requirementRepository.find({
      where: {
        active: true,
        nextAssessmentDue: Between(new Date(), upcomingDue),
      },
      relations: ['regulation'],
    });

    for (const requirement of requirements) {
      // Check if assessment already scheduled
      const existingAssessment = await this.assessmentRepository.findOne({
        where: {
          requirementId: requirement.id,
          status: In([AssessmentStatus.SCHEDULED, AssessmentStatus.IN_PROGRESS]),
        },
      });

      if (!existingAssessment) {
        const assessment = this.assessmentRepository.create({
          requirementId: requirement.id,
          assessmentDate: requirement.nextAssessmentDue,
          dueDate: requirement.nextAssessmentDue,
          status: AssessmentStatus.SCHEDULED,
          assessedBy: 1, // System user - should be configurable
        });

        await this.assessmentRepository.save(assessment);
        
        await this.notificationService.sendUpcomingAssessmentNotification(assessment, requirement);
      }
    }

    this.logger.log(`Scheduled assessments for ${requirements.length} requirements`);
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async checkCriticalFindings(): Promise<void> {
    this.logger.log('Checking critical findings');

    const criticalFindings = await this.findingRepository.find({
      where: {
        severity: FindingSeverity.CRITICAL,
        status: In([FindingStatus.OPEN, FindingStatus.IN_PROGRESS]),
        dueDate: LessThan(new Date()),
      },
      relations: ['assessment', 'assessment.requirement'],
    });

    for (const finding of criticalFindings) {
      await this.notificationService.sendOverdueCriticalFindingAlert(finding);
    }

    this.logger.log(`Processed ${criticalFindings.length} overdue critical findings`);
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private async getLatestAssessmentsByScore(score: ComplianceScore): Promise<ComplianceAssessment[]> {
    const query = this.assessmentRepository
      .createQueryBuilder('assessment')
      .innerJoin(
        (subQuery) => {
          return subQuery
            .select('requirement_id, MAX(assessment_date) as latest_date')
            .from('compliance_assessments', 'sub_assessment')
            .where('sub_assessment.status = :status', { status: AssessmentStatus.COMPLETED })
            .groupBy('requirement_id');
        },
        'latest',
        'assessment.requirement_id = latest.requirement_id AND assessment.assessment_date = latest.latest_date',
      )
      .where('assessment.score = :score', { score })
      .andWhere('assessment.status = :status', { status: AssessmentStatus.COMPLETED });

    return query.getMany();
  }

  private async getLatestAssessmentsForRequirements(requirementIds: number[]): Promise<ComplianceAssessment[]> {
    if (requirementIds.length === 0) return [];

    const query = this.assessmentRepository
      .createQueryBuilder('assessment')
      .innerJoin(
        (subQuery) => {
          return subQuery
            .select('requirement_id, MAX(assessment_date) as latest_date')
            .from('compliance_assessments', 'sub_assessment')
            .where('sub_assessment.requirement_id IN (:...requirementIds)', { requirementIds })
            .andWhere('sub_assessment.status = :status', { status: AssessmentStatus.COMPLETED })
            .groupBy('requirement_id');
        },
        'latest',
        'assessment.requirement_id = latest.requirement_id AND assessment.assessment_date = latest.latest_date',
      )
      .where('assessment.requirement_id IN (:...requirementIds)', { requirementIds })
      .andWhere('assessment.status = :status', { status: AssessmentStatus.COMPLETED });

    return query.getMany();
  }

  private async updateNextAssessmentDue(requirement: ComplianceRequirement): Promise<void> {
    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + requirement.assessmentFrequencyDays);
    
    requirement.nextAssessmentDue = nextDue;
    await this.requirementRepository.save(requirement);
  }

  private determineFindingSeverity(riskLevel?: RiskLevel): FindingSeverity {
    switch (riskLevel) {
      case RiskLevel.CRITICAL:
        return FindingSeverity.CRITICAL;
      case RiskLevel.HIGH:
        return FindingSeverity.HIGH;
      case RiskLevel.MEDIUM:
        return FindingSeverity.MEDIUM;
      case RiskLevel.LOW:
        return FindingSeverity.LOW;
      default:
        return FindingSeverity.MEDIUM;
    }
  }

  // ==================== REPORTING METHODS ====================

  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    regulationType?: RegulationType,
  ): Promise<any> {
    const query = this.assessmentRepository
      .createQueryBuilder('assessment')
      .leftJoinAndSelect('assessment.requirement', 'requirement')
      .leftJoinAndSelect('requirement.regulation', 'regulation')
      .where('assessment.assessmentDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('assessment.status = :status', { status: AssessmentStatus.COMPLETED });

    if (regulationType) {
      query.andWhere('regulation.type = :type', { type: regulationType });
    }

    const assessments = await query.getMany();

    const summary = {
      totalAssessments: assessments.length,
      compliant: assessments.filter(a => a.score === ComplianceScore.COMPLIANT).length,
      nonCompliant: assessments.filter(a => a.score === ComplianceScore.NON_COMPLIANT).length,
      partiallyCompliant: assessments.filter(a => a.score === ComplianceScore.PARTIALLY_COMPLIANT).length,
      averageScore: this.calculateAverageScore(assessments),
      complianceRate: 0,
    };

    summary.complianceRate = summary.totalAssessments > 0 
      ? (summary.compliant / summary.totalAssessments) * 100 
      : 0;

    const byRegulation = this.groupAssessmentsByRegulation(assessments);
    const byRiskLevel = this.groupAssessmentsByRiskLevel(assessments);
    const trends = await this.calculateComplianceTrends(startDate, endDate, regulationType);

    return {
      period: { startDate, endDate },
      regulationType: regulationType || 'ALL',
      summary,
      byRegulation,
      byRiskLevel,
      trends,
      assessments: assessments.map(a => ({
        id: a.id,
        requirementCode: a.requirement?.code,
        regulationCode: a.requirement?.regulation?.code,
        score: a.score,
        scorePercentage: a.scorePercentage,
        assessmentDate: a.assessmentDate,
        riskLevel: a.requirement?.riskLevel,
      })),
    };
  }

  async generateFindingsReport(
    startDate: Date,
    endDate: Date,
    severity?: FindingSeverity,
  ): Promise<any> {
    const query = this.findingRepository
      .createQueryBuilder('finding')
      .leftJoinAndSelect('finding.assessment', 'assessment')
      .leftJoinAndSelect('assessment.requirement', 'requirement')
      .leftJoinAndSelect('requirement.regulation', 'regulation')
      .leftJoinAndSelect('finding.correctiveActions', 'actions')
      .where('finding.identifiedDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (severity) {
      query.andWhere('finding.severity = :severity', { severity });
    }

    const findings = await query.getMany();

    const summary = {
      totalFindings: findings.length,
      bySeverity: {
        critical: findings.filter(f => f.severity === FindingSeverity.CRITICAL).length,
        high: findings.filter(f => f.severity === FindingSeverity.HIGH).length,
        medium: findings.filter(f => f.severity === FindingSeverity.MEDIUM).length,
        low: findings.filter(f => f.severity === FindingSeverity.LOW).length,
      },
      byStatus: {
        open: findings.filter(f => f.status === FindingStatus.OPEN).length,
        inProgress: findings.filter(f => f.status === FindingStatus.IN_PROGRESS).length,
        resolved: findings.filter(f => f.status === FindingStatus.RESOLVED).length,
        closed: findings.filter(f => f.status === FindingStatus.CLOSED).length,
      },
      averageResolutionTime: this.calculateAverageResolutionTime(findings),
      overdueFindings: findings.filter(f => 
        f.dueDate < new Date() && 
        f.status !== FindingStatus.RESOLVED && 
        f.status !== FindingStatus.CLOSED
      ).length,
    };

    return {
      period: { startDate, endDate },
      severity: severity || 'ALL',
      summary,
      findings: findings.map(f => ({
        id: f.id,
        title: f.title,
        severity: f.severity,
        status: f.status,
        identifiedDate: f.identifiedDate,
        dueDate: f.dueDate,
        resolvedDate: f.resolvedDate,
        requirementCode: f.assessment?.requirement?.code,
        regulationCode: f.assessment?.requirement?.regulation?.code,
        correctiveActionsCount: f.correctiveActions?.length || 0,
        daysSinceIdentified: Math.floor(
          (new Date().getTime() - f.identifiedDate.getTime()) / (1000 * 60 * 60 * 24)
        ),
      })),
    };
  }

  async getComplianceTrends(
    months: number = 12,
    regulationType?: RegulationType,
  ): Promise<any> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const trends = [];

    for (let i = 0; i < months; i++) {
      const monthStart = new Date(startDate);
      monthStart.setMonth(startDate.getMonth() + i);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0); // Last day of month

      const monthlyData = await this.getMonthlyComplianceData(
        monthStart,
        monthEnd,
        regulationType,
      );

      trends.push({
        month: monthStart.toISOString().substring(0, 7), // YYYY-MM format
        ...monthlyData,
      });
    }

    return trends;
  }

  private async getMonthlyComplianceData(
    startDate: Date,
    endDate: Date,
    regulationType?: RegulationType,
  ): Promise<any> {
    const query = this.assessmentRepository
      .createQueryBuilder('assessment')
      .leftJoin('assessment.requirement', 'requirement')
      .leftJoin('requirement.regulation', 'regulation')
      .where('assessment.assessmentDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('assessment.status = :status', { status: AssessmentStatus.COMPLETED });

    if (regulationType) {
      query.andWhere('regulation.type = :type', { type: regulationType });
    }

    const assessments = await query.getMany();

    const compliant = assessments.filter(a => a.score === ComplianceScore.COMPLIANT).length;
    const total = assessments.length;

    return {
      totalAssessments: total,
      compliantAssessments: compliant,
      complianceRate: total > 0 ? (compliant / total) * 100 : 0,
      averageScore: this.calculateAverageScore(assessments),
    };
  }

  private calculateAverageScore(assessments: ComplianceAssessment[]): number {
    const scored = assessments.filter(a => a.scorePercentage !== null);
    if (scored.length === 0) return 0;

    const total = scored.reduce((sum, a) => sum + (a.scorePercentage || 0), 0);
    return Math.round((total / scored.length) * 100) / 100;
  }

  private groupAssessmentsByRegulation(assessments: ComplianceAssessment[]): any {
    const grouped = assessments.reduce((acc, assessment) => {
      const regulation = assessment.requirement?.regulation;
      if (!regulation) return acc;

      const key = regulation.code;
      if (!acc[key]) {
        acc[key] = {
          regulationCode: regulation.code,
          regulationTitle: regulation.title,
          regulationType: regulation.type,
          totalAssessments: 0,
          compliant: 0,
          nonCompliant: 0,
          partiallyCompliant: 0,
          complianceRate: 0,
        };
      }

      acc[key].totalAssessments++;
      
      switch (assessment.score) {
        case ComplianceScore.COMPLIANT:
          acc[key].compliant++;
          break;
        case ComplianceScore.NON_COMPLIANT:
          acc[key].nonCompliant++;
          break;
        case ComplianceScore.PARTIALLY_COMPLIANT:
          acc[key].partiallyCompliant++;
          break;
      }

      acc[key].complianceRate = (acc[key].compliant / acc[key].totalAssessments) * 100;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }

  private groupAssessmentsByRiskLevel(assessments: ComplianceAssessment[]): any {
    const grouped = assessments.reduce((acc, assessment) => {
      const riskLevel = assessment.requirement?.riskLevel;
      if (!riskLevel) return acc;

      if (!acc[riskLevel]) {
        acc[riskLevel] = {
          riskLevel,
          totalAssessments: 0,
          compliant: 0,
          nonCompliant: 0,
          complianceRate: 0,
        };
      }

      acc[riskLevel].totalAssessments++;
      
      if (assessment.score === ComplianceScore.COMPLIANT) {
        acc[riskLevel].compliant++;
      } else if (assessment.score === ComplianceScore.NON_COMPLIANT) {
        acc[riskLevel].nonCompliant++;
      }

      acc[riskLevel].complianceRate = 
        (acc[riskLevel].compliant / acc[riskLevel].totalAssessments) * 100;

      return acc;
    }, {} as Record<string, any>);

    return Object.values(grouped);
  }

  private async calculateComplianceTrends(
    startDate: Date,
    endDate: Date,
    regulationType?: RegulationType,
  ): Promise<any> {
    // Calculate week-by-week trends within the date range
    const trends = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      if (weekEnd > endDate) {
        weekEnd.setTime(endDate.getTime());
      }

      const weekData = await this.getMonthlyComplianceData(
        weekStart,
        weekEnd,
        regulationType,
      );

      trends.push({
        weekStart: weekStart.toISOString().substring(0, 10),
        weekEnd: weekEnd.toISOString().substring(0, 10),
        ...weekData,
      });

      currentDate.setDate(currentDate.getDate() + 7);
    }

    return trends;
  }

  private calculateAverageResolutionTime(findings: Finding[]): number {
    const resolved = findings.filter(f => f.resolvedDate);
    if (resolved.length === 0) return 0;

    const totalDays = resolved.reduce((sum, finding) => {
      const days = Math.floor(
        (finding.resolvedDate!.getTime() - finding.identifiedDate.getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      return sum + days;
    }, 0);

    return Math.round(totalDays / resolved.length);
  }

  // ==================== BULK OPERATIONS ====================

  async bulkCreateRequirements(
    requirements: CreateComplianceRequirementDto[],
    createdBy: number,
  ): Promise<ComplianceRequirement[]> {
    this.logger.log(`Bulk creating ${requirements.length} compliance requirements`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const savedRequirements: ComplianceRequirement[] = [];

      for (const reqDto of requirements) {
        // Validate regulation exists
        const regulation = await queryRunner.manager.findOne(Regulation, {
          where: { id: reqDto.regulationId },
        });

        if (!regulation) {
          throw new BadRequestException(`Regulation with ID ${reqDto.regulationId} not found`);
        }

        // Check for duplicate codes
        const existing = await queryRunner.manager.findOne(ComplianceRequirement, {
          where: { code: reqDto.code },
        });

        if (existing) {
          this.logger.warn(`Skipping duplicate requirement code: ${reqDto.code}`);
          continue;
        }

        const nextAssessmentDue = new Date();
        nextAssessmentDue.setDate(nextAssessmentDue.getDate() + reqDto.assessmentFrequencyDays);

        const requirement = queryRunner.manager.create(ComplianceRequirement, {
          ...reqDto,
          nextAssessmentDue,
        });

        const saved = await queryRunner.manager.save(requirement);
        savedRequirements.push(saved);
      }

      await queryRunner.commitTransaction();

      // Log audit entry for bulk operation
      await this.auditService.log({
        eventType: 'MODIFICATION',
        severity: 'MEDIUM',
        resourceType: 'compliance_requirement',
        resourceId: 'bulk',
        description: `Bulk created ${savedRequirements.length} compliance requirements`,
        userId: createdBy,
        metadata: { count: savedRequirements.length },
      });

      this.logger.log(`Successfully created ${savedRequirements.length} requirements`);
      return savedRequirements;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Bulk requirement creation failed:', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async bulkUpdateAssessmentStatus(
    assessmentIds: number[],
    status: AssessmentStatus,
    updatedBy: number,
  ): Promise<void> {
    this.logger.log(`Bulk updating ${assessmentIds.length} assessment statuses to ${status}`);

    const result = await this.assessmentRepository.update(
      { id: In(assessmentIds) },
      { status },
    );

    await this.auditService.log({
      eventType: 'MODIFICATION',
      severity: 'MEDIUM',
      resourceType: 'compliance_assessment',
      resourceId: 'bulk',
      description: `Bulk updated ${result.affected} assessments to status: ${status}`,
      userId: updatedBy,
      metadata: { assessmentIds, status, affected: result.affected },
    });

    this.logger.log(`Updated ${result.affected} assessments`);
  }

  // ==================== DATA CLEANUP METHODS ====================

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cleanupOldAuditLogs(): Promise<void> {
    this.logger.log('Cleaning up old audit logs');

    const retentionDays = 2555; // 7 years for HIPAA compliance
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    // Note: This would typically archive rather than delete for compliance
    const result = await this.dataSource
      .createQueryBuilder()
      .select('COUNT(*)', 'count')
      .from('audit_logs', 'audit')
      .where('audit.timestamp < :cutoffDate', { cutoffDate })
      .getRawOne();

    this.logger.log(`Found ${result.count} audit logs older than ${retentionDays} days for archival`);
    
    // Implementation would move to archive storage rather than delete
    // await this.archiveOldAuditLogs(cutoffDate);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async updateExpiredAssessments(): Promise<void> {
    this.logger.log('Updating expired assessments');

    const now = new Date();
    const expiredAssessments = await this.assessmentRepository.find({
      where: {
        status: AssessmentStatus.SCHEDULED,
        dueDate: LessThan(now),
      },
    });

    for (const assessment of expiredAssessments) {
      assessment.status = AssessmentStatus.OVERDUE;
      await this.assessmentRepository.save(assessment);
    }

    this.logger.log(`Updated ${expiredAssessments.length} expired assessments to overdue`);
  }

  // ==================== UTILITY METHODS ====================

  async getAssessmentById(id: number): Promise<ComplianceAssessment> {
    const assessment = await this.assessmentRepository.findOne({
      where: { id },
      relations: [
        'requirement',
        'requirement.regulation',
        'findings',
        'findings.correctiveActions',
      ],
    });

    if (!assessment) {
      throw new NotFoundException('Assessment not found');
    }

    return assessment;
  }

  async getFindingById(id: number): Promise<Finding> {
    const finding = await this.findingRepository.findOne({
      where: { id },
      relations: [
        'assessment',
        'assessment.requirement',
        'assessment.requirement.regulation',
        'correctiveActions',
      ],
    });

    if (!finding) {
      throw new NotFoundException('Finding not found');
    }

    return finding;
  }

  async getUpcomingAssessments(days: number = 30): Promise<ComplianceAssessment[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.assessmentRepository.find({
      where: {
        status: AssessmentStatus.SCHEDULED,
        dueDate: Between(new Date(), futureDate),
      },
      relations: ['requirement', 'requirement.regulation'],
      order: { dueDate: 'ASC' },
    });
  }

  async searchAssessments(searchTerm: string): Promise<ComplianceAssessment[]> {
    return this.assessmentRepository
      .createQueryBuilder('assessment')
      .leftJoinAndSelect('assessment.requirement', 'requirement')
      .leftJoinAndSelect('requirement.regulation', 'regulation')
      .where('requirement.code ILIKE :search', { search: `%${searchTerm}%` })
      .orWhere('requirement.title ILIKE :search', { search: `%${searchTerm}%` })
      .orWhere('regulation.code ILIKE :search', { search: `%${searchTerm}%` })
      .orWhere('regulation.title ILIKE :search', { search: `%${searchTerm}%` })
      .orderBy('assessment.dueDate', 'ASC')
      .getMany();
  }
}