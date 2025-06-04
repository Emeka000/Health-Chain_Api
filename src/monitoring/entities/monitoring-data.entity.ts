import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum MonitoringType {
  HEART_RATE = 'heart_rate',
  BLOOD_PRESSURE = 'blood_pressure',
  TEMPERATURE = 'temperature',
  OXYGEN_SATURATION = 'oxygen_saturation',
  GLUCOSE = 'glucose',
  WEIGHT = 'weight',
}

@Entity()
export class MonitoringData {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.monitoringData)
  patient: User;

  @Column({ type: 'enum', enum: MonitoringType })
  type: MonitoringType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  value: number;

  @Column({ nullable: true })
  unit: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ type: 'datetime' })
  measuredAt: Date;

  @Column({ default: false })
  isAlert: boolean;

  @Column({ type: 'text', nullable: true })
  alertMessage: string;

  @CreateDateColumn()
  createdAt: Date;
}