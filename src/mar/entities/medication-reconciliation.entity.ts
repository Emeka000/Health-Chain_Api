import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';

export enum ReconciliationType {
  ADMISSION = 'admission',
  TRANSFER = 'transfer',
  DISCHARGE = 'discharge',
}

export enum ReconciliationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REVIEWED = 'reviewed',
}

@Entity()
export class MedicationReconciliation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient)
  patient: Patient;

  @Column({ type: 'enum', enum: ReconciliationType })
  type: ReconciliationType;

  @Column({
    type: 'enum',
    enum: ReconciliationStatus,
    default: ReconciliationStatus.PENDING,
  })
  status: ReconciliationStatus;

  @Column({ type: 'json' })
  homeMedications: any[]; // Array of home medications

  @Column({ type: 'json' })
  currentMedications: any[]; // Array of current hospital medications

  @Column({ type: 'json', nullable: true })
  discrepancies: any[]; // Array of identified discrepancies

  @Column({ nullable: true })
  pharmacistId: string;

  @Column({ nullable: true })
  pharmacistName: string;

  @Column({ nullable: true })
  reviewedById: string;

  @Column({ nullable: true })
  reviewedByName: string;

  @Column({ nullable: true })
  reviewedAt: Date;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
