import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PathologyCase } from './pathology-case.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

export enum QAType {
  PEER_REVIEW = 'peer_review',
  SECOND_OPINION = 'second_opinion',
  RANDOM_REVIEW = 'random_review',
  TARGETED_REVIEW = 'targeted_review',
  CORRELATION_REVIEW = 'correlation_review',
  EXTERNAL_CONSULTATION = 'external_consultation'
}

export enum QAStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  COMPLETED = 'completed',
  REQUIRES_ACTION = 'requires_action',
  CLOSED = 'closed'
}

export enum QAOutcome {
  CONCORDANT = 'concordant',
  MINOR_DISCORDANT = 'minor_discordant',
  MAJOR_DISCORDANT = 'major_discordant',
  EDUCATIONAL = 'educational',
  TECHNICAL_ISSUE = 'technical_issue'
}

@Entity('quality_assurance')
export class QualityAssurance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  qaNumber: string;

  @Column({
    type: 'enum',
    enum: QAType
  })
  qaType: QAType;

  @Column({
    type: 'enum',
    enum: QAStatus,
    default: QAStatus.PENDING
  })
  status: QAStatus;

  @Column({
    type: 'enum',
    enum: QAOutcome,
    nullable: true
  })
  outcome: QAOutcome;

  @Column('text')
  reason: string;

  @Column('text', { nullable: true })
  reviewComments: string;

  @Column('text', { nullable: true })
  recommendations: string;

  @Column('simple-json', { nullable: true })
  discrepancyDetails: {
    originalDiagnosis: string;
    reviewDiagnosis: string;
    discrepancyType: string;
    clinicalImpact: string;
    rootCause: string;
  };

  @Column('simple-json', { nullable: true })
  correctiveActions: Array<{
    action: string;
    assignedTo: string;
    dueDate: Date;
    completed: boolean;
    completedDate: Date;
  }>;

  @Column()
  initiatedDate: Date;

  @Column({ nullable: true })
  completedDate: Date;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ default: false })
  isConfidential: boolean;

  @Column('simple-json', { nullable: true })
  metricsData: {
    turnaroundTime: number;
    diagnosticAccuracy: number;
    technicalQuality: number;
    reportQuality: number;
    overallScore: number;
  };

  @ManyToOne(() => PathologyCase, pathologyCase => pathologyCase.qualityAssurances)
  pathologyCase: PathologyCase;

  @ManyToOne(() => Doctor, doctor => doctor.initiatedQAs)
  initiatedBy: Doctor;

  @ManyToOne(() => Doctor, doctor => doctor.reviewedQAs)
  reviewer: Doctor;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}