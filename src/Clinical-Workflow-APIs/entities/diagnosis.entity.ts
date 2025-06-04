import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { TreatmentPlan } from './treatment-plan.entity';

@Entity('diagnoses')
export class Diagnosis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  physicianId: string;

  @Column()
  icdCode: string;

  @Column()
  description: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'enum', enum: ['primary', 'secondary', 'differential'] })
  type: string;

  @Column({ type: 'enum', enum: ['confirmed', 'provisional', 'rule_out'] })
  status: string;

  @Column({ type: 'integer', default: 1 })
  severity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TreatmentPlan, plan => plan.diagnosis)
  treatmentPlans: TreatmentPlan[];
}
