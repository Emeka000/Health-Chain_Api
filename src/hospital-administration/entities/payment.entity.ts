import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Bill } from './bill.entity';
import { Patient } from './patient.entity';

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  INSURANCE = 'insurance',
  CHECK = 'check',
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payment_number', unique: true })
  paymentNumber: string;

  @Column({ name: 'payment_date' })
  paymentDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  method: PaymentMethod;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Column({ name: 'reference_number', nullable: true })
  referenceNumber: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ name: 'processed_by', nullable: true })
  processedBy: string;

  @Column({ name: 'bill_id' })
  billId: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Bill, (bill) => bill.payments)
  @JoinColumn({ name: 'bill_id' })
  bill: Bill;

  @ManyToOne(() => Patient, (patient) => patient)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
