import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
// import { IsString, IsNumber, Min, Max } from 'class-validator';

@Entity('treatment_outcomes')
export class TreatmentOutcome {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  treatmentPlanId: string;

  @Column()
  outcomeSummary: string;

  @Column('float')
  improvementScore: number;

  @CreateDateColumn()
  recordedAt: Date;
}

