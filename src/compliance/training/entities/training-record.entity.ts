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
import { TrainingProgram } from './training-program.entity';
import { PolicyProcedure } from '../../entities/policy-procedure.entity';

export enum TrainingStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired',
  OVERDUE = 'overdue',
}

@Entity('training_records')
@Index(['employeeId', 'programId'], { unique: true })
@Index(['employeeId', 'status'])
@Index(['completionDate', 'expirationDate'])
export class TrainingRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'employee_id' })
  employeeId: number;

  @Column({ name: 'program_id' })
  programId: number;

  @Column({ name: 'policy_id', nullable: true })
  policyId?: number;

  @Column({
    type: 'enum',
    enum: TrainingStatus,
    default: TrainingStatus.NOT_STARTED,
  })
  status: TrainingStatus;

  @Column({ name: 'assigned_date' })
  assignedDate: Date;

  @Column({ name: 'started_date', nullable: true })
  startedDate?: Date;

  @Column({ name: 'completion_date', nullable: true })
  completionDate?: Date;

  @Column({ name: 'due_date' })
  dueDate: Date;

  @Column({ name: 'expiration_date', nullable: true })
  expirationDate?: Date;

  @Column({
    name: 'score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  score?: number;

  @Column({ name: 'attempts', default: 0 })
  attempts: number;

  @Column({
    name: 'time_spent_hours',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  timeSpentHours?: number;

  @Column({ name: 'instructor_id', nullable: true })
  instructorId?: number;

  @Column('text', { nullable: true })
  notes?: string;

  @Column({ name: 'certificate_issued', default: false })
  certificateIssued: boolean;

  @Column({ name: 'certificate_number', nullable: true })
  certificateNumber?: string;

  @Column({ type: 'json', nullable: true })
  completionData?: Record<string, any>;

  @ManyToOne(() => TrainingProgram, (program) => program.trainingRecords)
  @JoinColumn({ name: 'program_id' })
  program: TrainingProgram;

  @ManyToOne(() => PolicyProcedure, (policy) => policy.trainingRecords)
  @JoinColumn({ name: 'policy_id' })
  policy?: PolicyProcedure;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
