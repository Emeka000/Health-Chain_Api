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

export enum CompetencyType {
  TECHNICAL = 'technical',
  BEHAVIORAL = 'behavioral',
  REGULATORY = 'regulatory',
  SAFETY = 'safety',
  CLINICAL = 'clinical',
}

export enum AssessmentMethod {
  WRITTEN_TEST = 'written_test',
  PRACTICAL_DEMONSTRATION = 'practical_demonstration',
  OBSERVATION = 'observation',
  SIMULATION = 'simulation',
  PEER_REVIEW = 'peer_review',
  PORTFOLIO = 'portfolio',
}

export enum CompetencyLevel {
  NOVICE = 'novice',
  COMPETENT = 'competent',
  PROFICIENT = 'proficient',
  EXPERT = 'expert',
}

@Entity('competency_assessments')
@Index(['employeeId', 'programId'])
@Index(['assessmentDate', 'competencyLevel'])
export class CompetencyAssessment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'employee_id' })
  employeeId: number;

  @Column({ name: 'program_id' })
  programId: number;

  @Column({
    type: 'enum',
    enum: CompetencyType,
  })
  competencyType: CompetencyType;

  @Column({
    type: 'enum',
    enum: AssessmentMethod,
  })
  assessmentMethod: AssessmentMethod;

  @Column({ name: 'assessment_date' })
  assessmentDate: Date;

  @Column({
    type: 'enum',
    enum: CompetencyLevel,
  })
  competencyLevel: CompetencyLevel;

  @Column({ name: 'assessor_id' })
  assessorId: number;

  @Column({ name: 'score', type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ name: 'maximum_score', type: 'decimal', precision: 5, scale: 2 })
  maximumScore: number;

  @Column({ name: 'competency_achieved', default: false })
  competencyAchieved: boolean;

  @Column({ name: 'next_assessment_date', nullable: true })
  nextAssessmentDate?: Date;

  @Column('text', { nullable: true })
  strengths?: string;

  @Column('text', { nullable: true })
  improvementAreas?: string;

  @Column('text', { nullable: true })
  developmentPlan?: string;

  @Column({ type: 'json', nullable: true })
  assessmentData?: Record<string, any>;

  @ManyToOne(() => TrainingProgram, (program) => program.competencyAssessments)
  @JoinColumn({ name: 'program_id' })
  program: TrainingProgram;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
