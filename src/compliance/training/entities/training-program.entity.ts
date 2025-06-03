import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { TrainingRecord } from './training-record.entity';
import { CompetencyAssessment } from './competency-assessment.entity';

export enum TrainingType {
  HIPAA = 'hipaa',
  PRIVACY = 'privacy',
  SECURITY = 'security',
  SAFETY = 'safety',
  CLINICAL = 'clinical',
  REGULATORY = 'regulatory',
  CUSTOM = 'custom',
}

export enum TrainingDeliveryMethod {
  ONLINE = 'online',
  IN_PERSON = 'in_person',
  BLENDED = 'blended',
  SELF_STUDY = 'self_study',
  ON_THE_JOB = 'on_the_job',
}

export enum ProgramStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UNDER_DEVELOPMENT = 'under_development',
  NEEDS_UPDATE = 'needs_update',
}

@Entity('training_programs')
@Index(['type', 'status'])
@Index(['mandatory', 'status'])
export class TrainingProgram {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: TrainingType,
  })
  type: TrainingType;

  @Column({
    type: 'enum',
    enum: TrainingDeliveryMethod,
  })
  deliveryMethod: TrainingDeliveryMethod;

  @Column({
    type: 'enum',
    enum: ProgramStatus,
    default: ProgramStatus.ACTIVE,
  })
  status: ProgramStatus;

  @Column({ name: 'duration_hours' })
  durationHours: number;

  @Column({ default: false })
  mandatory: boolean;

  @Column({ name: 'recertification_required', default: true })
  recertificationRequired: boolean;

  @Column({ name: 'recertification_period_months', nullable: true })
  recertificationPeriodMonths?: number;

  @Column({ name: 'passing_score', type: 'decimal', precision: 5, scale: 2 })
  passingScore: number;

  @Column({ name: 'max_attempts', default: 3 })
  maxAttempts: number;

  @Column({ type: 'simple-array', nullable: true })
  targetRoles?: string[];

  @Column({ type: 'simple-array', nullable: true })
  prerequisites?: string[];

  @Column('text', { nullable: true })
  learningObjectives?: string;

  @Column({ type: 'json', nullable: true })
  content?: Record<string, any>;

  @Column({ name: 'created_by' })
  createdBy: number;

  @OneToMany(() => TrainingRecord, (record) => record.program)
  trainingRecords: TrainingRecord[];

  @OneToMany(() => CompetencyAssessment, (assessment) => assessment.program)
  competencyAssessments: CompetencyAssessment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
