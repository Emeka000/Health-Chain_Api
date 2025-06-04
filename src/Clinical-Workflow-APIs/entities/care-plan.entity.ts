import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { TreatmentTracking } from './treatment-tracking.entity';

@Entity('care_plans')
export class CarePlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  coordinatorId: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json' })
  goals: object;

  @Column({ type: 'json' })
  careTeam: object;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'enum', enum: ['draft', 'active', 'completed', 'suspended'] })
  status: string;

  @Column({ type: 'json', nullable: true })
  assessments: object;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => TreatmentTracking, tracking => tracking.carePlan)
  treatmentTracking: TreatmentTracking[];
}
