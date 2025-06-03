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
import { ComplianceAssessment } from './compliance-assessment.entity';
import { CorrectiveAction } from './corrective-action.entity';

export enum FindingSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFORMATIONAL = 'informational',
}

export enum FindingStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  VERIFIED = 'verified',
  CLOSED = 'closed',
  DEFERRED = 'deferred',
}

@Entity('findings')
@Index(['assessmentId', 'severity'])
@Index(['status', 'dueDate'])
export class Finding {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'assessment_id' })
  assessmentId: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: FindingSeverity,
  })
  severity: FindingSeverity;

  @Column({
    type: 'enum',
    enum: FindingStatus,
    default: FindingStatus.OPEN,
  })
  status: FindingStatus;

  @Column({ name: 'identified_date' })
  identifiedDate: Date;

  @Column({ name: 'due_date' })
  dueDate: Date;

  @Column({ name: 'resolved_date', nullable: true })
  resolvedDate?: Date;

  @Column({ name: 'identified_by' })
  identifiedBy: number;

  @Column({ name: 'assigned_to', nullable: true })
  assignedTo?: number;

  @Column('text', { nullable: true })
  root_cause?: string;

  @Column('text', { nullable: true })
  business_impact?: string;

  @Column({ type: 'json', nullable: true })
  evidence?: Record<string, any>;

  @ManyToOne(() => ComplianceAssessment, (assessment) => assessment.findings)
  @JoinColumn({ name: 'assessment_id' })
  assessment: ComplianceAssessment;

  @OneToMany(() => CorrectiveAction, (action) => action.finding)
  correctiveActions: CorrectiveAction[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
