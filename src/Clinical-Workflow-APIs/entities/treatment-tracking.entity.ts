import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { CarePlan } from './care-plan.entity';

@Entity('treatment_tracking')
export class TreatmentTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  treatmentType: string;

  @Column()
  description: string;

  @Column({ type: 'json' })
  metrics: object;

  @Column({ type: 'json', nullable: true })
  outcomes: object;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'enum', enum: ['scheduled', 'completed', 'missed', 'cancelled'] })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => CarePlan, carePlan => carePlan.treatmentTracking)
  carePlan: CarePlan;
}