import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { LabOrder } from './lab-order.entity';

export enum WorkflowStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
  CANCELLED = 'cancelled'
}

export enum WorkflowStepType {
  SAMPLE_COLLECTION = 'sample_collection',
  SAMPLE_PREPARATION = 'sample_preparation',
  TESTING = 'testing',
  QUALITY_CONTROL = 'quality_control',
  RESULT_VERIFICATION = 'result_verification',
  REPORTING = 'reporting'
}

@Entity('lab_workflows')
export class LabWorkflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LabOrder, order => order.workflows)
  labOrder: LabOrder;

  @Column()
  labOrderId: string;

  @Column({ type: 'enum', enum: WorkflowStepType })
  stepType: WorkflowStepType;

  @Column()
  stepName: string;

  @Column({ type: 'enum', enum: WorkflowStatus, default: WorkflowStatus.PENDING })
  status: WorkflowStatus;

  @Column({ type: 'int', default: 0 })
  sequenceOrder: number;

  @Column({ nullable: true })
  assignedTo: string;

  @Column({ type: 'timestamp', nullable: true })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'json', nullable: true })
  stepData: any;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
