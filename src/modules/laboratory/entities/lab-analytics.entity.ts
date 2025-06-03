import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('lab_analytics')
export class LabAnalytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ default: 0 })
  ordersReceived: number;

  @Column({ default: 0 })
  ordersCompleted: number;

  @Column({ default: 0 })
  ordersInProgress: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  averageTurnaroundTime: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  qualityScore: number;

  @Column({ type: 'json', nullable: true })
  testVolumeByCategory: any;

  @Column({ type: 'json', nullable: true })
  equipmentUtilization: any;

  @Column({ type: 'json', nullable: true })
  performanceMetrics: any;

  @CreateDateColumn()
  createdAt: Date;
}
