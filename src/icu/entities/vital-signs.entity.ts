import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IcuPatient } from './icu-patient.entity';

@Entity()
export class VitalSigns {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => IcuPatient, patient => patient.vitalSigns)
  patient: IcuPatient;

  @Column('decimal', { precision: 5, scale: 2 })
  heartRate: number;

  @Column('decimal', { precision: 5, scale: 2 })
  bloodPressureSystolic: number;

  @Column('decimal', { precision: 5, scale: 2 })
  bloodPressureDiastolic: number;

  @Column('decimal', { precision: 5, scale: 2 })
  temperature: number;

  @Column('decimal', { precision: 5, scale: 2 })
  respiratoryRate: number;

  @Column('decimal', { precision: 5, scale: 2 })
  oxygenSaturation: number;

  @Column()
  alertStatus: 'normal' | 'warning' | 'critical';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  recordedAt: Date;
} 