import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PrescriptionItem } from './prescription-item.entity';
import { Patient } from './patient.entity';

export enum PrescriptionStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  FILLED = 'FILLED',
  DISPENSED = 'DISPENSED',
  CANCELLED = 'CANCELLED',
}

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  prescriptionNumber: string;

  @ManyToOne(() => Patient, (patient) => patient.prescriptions)
  patient: Patient;

  @Column()
  patientId: string;

  @Column({ length: 200 })
  prescriberName: string;

  @Column({ length: 50 })
  prescriberLicense: string;

  @Column()
  prescribedDate: Date;

  @Column({
    type: 'enum',
    enum: PrescriptionStatus,
    default: PrescriptionStatus.PENDING,
  })
  status: PrescriptionStatus;

  @Column({ nullable: true })
  verifiedBy: string; // Pharmacist ID

  @Column({ nullable: true })
  verifiedAt: Date;

  @Column({ nullable: true })
  dispensedBy: string; // Pharmacist ID

  @Column({ nullable: true })
  dispensedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ default: false })
  isControlledSubstance: boolean;

  @OneToMany(() => PrescriptionItem, (item) => item.prescription, {
    cascade: true,
  })
  items: PrescriptionItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
