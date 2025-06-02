import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
  } from 'typeorm';
  import { Finding } from './finding.entity';
  
  export enum ActionType {
    IMMEDIATE = 'immediate',
    CORRECTIVE = 'corrective',
    PREVENTIVE = 'preventive',
    SYSTEMIC = 'systemic',
  }
  
  export enum ActionStatus {
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    VERIFIED = 'verified',
    CLOSED = 'closed',
    CANCELLED = 'cancelled',
  }
  
  export enum ActionPriority {
    CRITICAL = 'critical',
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
  }
  
  @Entity('corrective_actions')
  @Index(['findingId', 'status'])
  @Index(['assignedTo', 'dueDate'])
  @Index(['priority', 'status'])
  export class CorrectiveAction {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ name: 'finding_id' })
    findingId: number;
  
    @Column()
    title: string;
  
    @Column('text')
    description: string;
  
    @Column({
      type: 'enum',
      enum: ActionType,
    })
    type: ActionType;
  
    @Column({
      type: 'enum',
      enum: ActionStatus,
      default: ActionStatus.PLANNED,
    })
    status: ActionStatus;
  
    @Column({
      type: 'enum',
      enum: ActionPriority,
    })
    priority: ActionPriority;
  
    @Column({ name: 'assigned_to' })
    assignedTo: number;
  
    @Column({ name: 'assigned_by' })
    assignedBy: number;
  
    @Column({ name: 'assigned_date' })
    assignedDate: Date;
  
    @Column({ name: 'due_date' })
    dueDate: Date;
  
    @Column({ name: 'completed_date', nullable: true })
    completedDate?: Date;
  
    @Column({ name: 'verified_date', nullable: true })
    verifiedDate?: Date;
  
    @Column({ name: 'verified_by', nullable: true })
    verifiedBy?: number;
  
    @Column('text', { nullable: true })
    implementation_notes?: string;
  
    @Column('text', { nullable: true })
    verification_notes?: string;
  
    @Column({ name: 'estimated_cost', type: 'decimal', precision: 10, scale: 2, nullable: true })
    estimatedCost?: number;
  
    @Column({ name: 'actual_cost', type: 'decimal', precision: 10, scale: 2, nullable: true })
    actualCost?: number;
  
    @Column({ type: 'json', nullable: true })
    attachments?: Record<string, any>;
  
    @ManyToOne(() => Finding, finding => finding.correctiveActions)
    @JoinColumn({ name: 'finding_id' })
    finding: Finding;
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }
  