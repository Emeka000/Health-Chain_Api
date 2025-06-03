import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IcuPatient } from './icu-patient.entity';

@Entity()
export class Ventilator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  deviceId: string;

  @Column()
  model: string;

  @Column()
  status: 'active' | 'standby' | 'maintenance';

  @ManyToOne(() => IcuPatient, patient => patient.bed)
  patient: IcuPatient;

  @Column('decimal', { precision: 5, scale: 2 })
  tidalVolume: number;

  @Column('decimal', { precision: 5, scale: 2 })
  respiratoryRate: number;

  @Column('decimal', { precision: 5, scale: 2 })
  fio2: number;

  @Column('decimal', { precision: 5, scale: 2 })
  peep: number;

  @Column()
  mode: 'volume-control' | 'pressure-control' | 'pressure-support';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastCalibration: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;
} 