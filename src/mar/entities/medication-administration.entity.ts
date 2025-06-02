import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { MedicationOrder } from './medication-order.entity';

export enum AdministrationStatus {
  GIVEN = 'given',
  NOT_GIVEN = 'not_given',
  REFUSED = 'refused',
  HELD = 'held',
  MISSED = 'missed',
}

export enum NotGivenReason {
  PATIENT_REFUSED = 'patient_refused',
  PATIENT_UNAVAILABLE = 'patient_unavailable',
  MEDICATION_UNAVAILABLE = 'medication_unavailable',
  PHYSICIAN_ORDER = 'physician_order',
  ADVERSE_REACTION = 'adverse_reaction',
  OTHER = 'other',
}

@Entity()
export class MedicationAdministration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, (patient) => patient.administrations)
  patient: Patient;

  @ManyToOne(() => MedicationOrder, (order) => order.administrations)
  order: MedicationOrder;

  @Column()
  scheduledTime: Date;

  @Column({ nullable: true })
  actualTime: Date;

  @Column({ type: 'enum', enum: AdministrationStatus })
  status: AdministrationStatus;

  @Column({ type: 'enum', enum: NotGivenReason, nullable: true })
  notGivenReason: NotGivenReason;

  @Column({ nullable: true })
  notes: string;

  @Column()
  nurseId: string;

  @Column()
  nurseName: string;

  @Column({ nullable: true })
  witnessId: string;

  @Column({ nullable: true })
  witnessName: string;

  @Column({ default: false })
  barcodeVerified: boolean;

  @Column({ nullable: true })
  scannedBarcode: string;

  @CreateDateColumn()
  createdAt: Date;
}
