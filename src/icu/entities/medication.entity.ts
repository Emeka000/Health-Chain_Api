import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IcuPatient } from './icu-patient.entity';

@Entity()
export class Medication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => IcuPatient, patient => patient.medications)
  patient: IcuPatient;

  @Column()
  name: string;

  @Column()
  dosage: string;

  @Column()
  route: 'iv' | 'oral' | 'im' | 'sc';

  @Column()
  frequency: string;

  @Column()
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column()
  prescribedBy: string;

  @Column()
  administeredBy: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastAdministered: Date;

  @Column()
  status: 'active' | 'completed' | 'discontinued';

  @Column({ nullable: true })
  notes: string;
} 