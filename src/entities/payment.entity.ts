import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Claim } from './claim.entity';

export enum PaymentType {
  INSURANCE_PAYMENT = 'insurance_payment',
  PATIENT_PAYMENT = 'patient_payment',
  ADJUSTMENT = 'adjustment',
  REFUND = 'refund'
}

export enum PaymentMethod {
  CHECK = 'check',
  ACH = 'ach',
  CREDIT_CARD = 'credit_card',
  CASH = 'cash',
  ELECTRONIC = 'electronic'
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Claim, claim => claim.payments)
  claim: Claim;

  @Column()
  claimId: string;

  @Column({ type: 'enum', enum: PaymentType })
  paymentType: PaymentType;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  paymentDate: Date;

  @Column({ nullable: true })
  referenceNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}