import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity()
export class HealthMetric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // 'blood_pressure', 'weight', 'heart_rate', 'blood_sugar'

  @Column('decimal', { precision: 10, scale: 2 })
  value: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'json', nullable: true })
  additionalData: any;

  @CreateDateColumn()
  recordedAt: Date;

  @ManyToOne(() => Patient, patient => patient.healthMetrics)
  patient: Patient;
}
