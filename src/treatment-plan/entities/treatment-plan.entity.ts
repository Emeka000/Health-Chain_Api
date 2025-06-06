import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('treatment_plans')
export class TreatmentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  diagnosisId: string;

  @Column('text')
  objectives: string;

  @Column('text')
  interventions: string;

  @Column()
  responsibleDoctorId: string;

  @Column({ default: 'active' })
  status: 'active' | 'completed' | 'cancelled';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}