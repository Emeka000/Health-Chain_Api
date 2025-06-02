import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Medication } from './medication.entity';
import { MedicationAdministration } from './medication-administration.entity';

export enum OrderStatus {
  ACTIVE = 'active',
  DISCONTINUED = 'discontinued',
  COMPLETED = 'completed',
  HOLD = 'hold',
}

export enum FrequencyType {
  ONCE = 'once',
  BID = 'bid', // twice daily
  TID = 'tid', // three times daily
  QID = 'qid', // four times daily
  Q4H = 'q4h', // every 4 hours
  Q6H = 'q6h', // every 6 hours
  Q8H = 'q8h', // every 8 hours
  Q12H = 'q12h', // every 12 hours
  DAILY = 'daily',
  PRN = 'prn', // as needed
}

@Entity()
export class MedicationOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, (patient) => patient.medicationOrders)
  patient: Patient;

  @ManyToOne(() => Medication, (medication) => medication.orders)
  medication: Medication;

  @Column()
  dose: string;

  @Column()
  route: string; // oral, IV, IM, etc.

  @Column({ type: 'enum', enum: FrequencyType })
  frequency: FrequencyType;

  @Column({ type: 'json', nullable: true })
  scheduledTimes: string[]; // Array of time strings like ["08:00", "12:00", "18:00"]

  @Column()
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.ACTIVE })
  status: OrderStatus;

  @Column()
  prescriberId: string;

  @Column({ nullable: true })
  instructions: string;

  @Column({ default: false })
  isPrn: boolean; // Pro re nata (as needed)s

  @Column({ nullable: true })
  prnIndication: string;

  @OneToMany(() => MedicationAdministration, (admin) => admin.order)
  administrations: MedicationAdministration[];

  @CreateDateColumn()
  createdAt: Date;
}
