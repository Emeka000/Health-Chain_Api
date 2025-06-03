import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ComplianceRequirement } from './compliance-requirement.entity';
import { Finding } from './finding.entity';

export enum AssessmentStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  OVERDUE = 'overdue',
}

export enum ComplianceScore {
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  PARTIALLY_COMPLIANT = 'partially_compliant',
  NOT_APPLICABLE = 'not_applicable',
  PENDING_REVIEW = 'pending_review',
}

@Entity('compliance_assessments')
@Index(['requirementId', 'assessmentDate'])
@Index(['status', 'dueDate'])
@Index(['score', 'assessmentDate'])
export class ComplianceAssessment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'requirement_id' })
  requirementId: number;

  @Column({ name: 'assessment_date' })
  assessmentDate: Date;

  @Column({ name: 'due_date' })
  dueDate: Date;

  @Column({
    type: 'enum',
    enum: AssessmentStatus,
    default: AssessmentStatus.SCHEDULED,
  })
  status: AssessmentStatus;

  @Column({
    type: 'enum',
    enum: ComplianceScore,
    nullable: true,
  })
  score?: ComplianceScore;

  @Column({ name: 'assessed_by' })
  assessedBy: number;

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy?: number;

  @Column('text', { nullable: true })
  notes?: string;

  @Column('text', { nullable: true })
  evidence?: string;

  @Column({ type: 'json', nullable: true })
  documentation?: Record<string, any>;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  scorePercentage?: number;

  @Column({ name: 'remediation_required', default: false })
  remediationRequired: boolean;

  @Column({ name: 'remediation_deadline', nullable: true })
  remediationDeadline?: Date;

  @ManyToOne(
    () => ComplianceRequirement,
    (requirement) => requirement.assessments,
  )
  @JoinColumn({ name: 'requirement_id' })
  requirement: ComplianceRequirement;

  @OneToMany(() => Finding, (finding) => finding.assessment)
  findings: Finding[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
