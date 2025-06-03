import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { BillItem } from './bill-item.entity';
import { Payment } from './payment.entity';

export enum BillStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

@Entity('bills')
export class Bill {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'bill_number', unique: true })
  billNumber: string;

  @Column({ name: 'bill_date' })
  billDate: Date;

  @Column({ name: 'due_date' })
  dueDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'subtotal' })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'tax_amount' })
  taxAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'discount_amount',
    default: 0,
  })
  discountAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'paid_amount',
    default: 0,
  })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'balance_amount' })
  balanceAmount: number;

  @Column({ type: 'enum', enum: BillStatus, default: BillStatus.DRAFT })
  status: BillStatus;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => Patient, (patient) => patient.bills)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @OneToMany(() => BillItem, (billItem) => billItem.bill, { cascade: true })
  items: BillItem[];

  @OneToMany(() => Payment, (payment) => payment.bill)
  payments: Payment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
