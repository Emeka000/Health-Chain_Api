import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from 'typeorm';
import { IcuPatient } from './icu-patient.entity';

@Entity()
export class IcuBed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bedNumber: string;

  @Column()
  status: 'available' | 'occupied' | 'maintenance';

  @Column()
  bedType: 'standard' | 'isolation' | 'negative-pressure';

  @Column()
  equipment: string[];

  @OneToOne(() => IcuPatient, patient => patient.bed)
  patient: IcuPatient;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;
} 