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
  import { TrainingRecord } from '../training/entities/training-record.entity';
  
  export enum PolicyStatus {
    DRAFT = 'draft',
    UNDER_REVIEW = 'under_review',
    APPROVED = 'approved',
    ACTIVE = 'active',
    REVISION_REQUIRED = 'revision_required',
    ARCHIVED = 'archived',
  }
  
  export enum PolicyType {
    POLICY = 'policy',
    PROCEDURE = 'procedure',
    GUIDELINE = 'guideline',
    STANDARD = 'standard',
    PROTOCOL = 'protocol',
  }
  
  @Entity('policy_procedures')
  @Index(['requirementId', 'status'])
  @Index(['type', 'status'])
  @Index(['nextReviewDate'])
  export class PolicyProcedure {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ name: 'requirement_id', nullable: true })
    requirementId?: number;
  
    @Column({ unique: true })
    number: string;
  
    @Column()
    title: string;
  
    @Column('text')
    description: string;
  
    @Column({
      type: 'enum',
      enum: PolicyType,
    })
    type: PolicyType;
  
    @Column({
      type: 'enum',
      enum: PolicyStatus,
      default: PolicyStatus.DRAFT,
    })
    status: PolicyStatus;
  
    @Column()
    version: string;
  
    @Column({ name: 'effective_date' })
    effectiveDate: Date;
  
    @Column({ name: 'review_frequency_months' })
    reviewFrequencyMonths: number;
  
    @Column({ name: 'next_review_date' })
    nextReviewDate: Date;
  
    @Column({ name: 'approved_by', nullable: true })
    approvedBy?: number;
  
    @Column({ name: 'approval_date', nullable: true })
    approvalDate?: Date;
  
    @Column({ name: 'created_by' })
    createdBy: number;
  
    @Column('text')
    content: string;
  
    @Column({ type: 'json', nullable: true })
    attachments?: Record<string, any>;
  
    @Column({ name: 'training_required', default: false })
    trainingRequired: boolean;
  
    @Column({ type: 'simple-array', nullable: true })
    applicableRoles?: string[];
  
    @ManyToOne(() => ComplianceRequirement, requirement => requirement.policies)
    @JoinColumn({ name: 'requirement_id' })
    requirement?: ComplianceRequirement;
  
    @OneToMany(() => TrainingRecord, training => training.policy)
    trainingRecords: TrainingRecord[];
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }