import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { MetricType } from '../enums/metric-type.enum';

@Entity('performance_metrics')
export class PerformanceMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  doctorId: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.performanceMetrics)
  doctor: Doctor;

  @Column({ type: 'enum', enum: MetricType })
  metricType: MetricType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ nullable: true })
  unit: string; // e.g., 'minutes', 'percentage', 'count'

  @Column({ type: 'date' })
  recordedDate: Date;

  @Column()
  recordedBy: string; // User ID who recorded the metric

  @Column({ nullable: true })
  period: string; // e.g., 'Q1 2024', 'January 2024'

  @Column({ type: 'jsonb', nullable: true })
  additionalData: {
    patientCount?: number;
    caseComplexity?: 'LOW' | 'MEDIUM' | 'HIGH';
    departmentAverage?: number;
    benchmarkValue?: number;
    improvementTarget?: number;
  };

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
