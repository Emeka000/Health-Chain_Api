import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Billing } from './billing.entity';
import { Insurance } from './insurance.entity';
import { Payment } from './payment.entity';
import { ClaimDenial } from './claim-denial.entity';

export enum ClaimStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  ACCEPTED = 'accepted',
  PAID = 'paid',
  DENIED = 'denied',
  APPEALED = 'appealed',
  RESUBMITTED = 'resubmitted'
}

@Entity('claims')
export class Claim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  claimNumber: string;

  @ManyToOne(() => Billing, billing => billing.claims)
  billing: Billing;

  @Column()
  billingId: string;

  @ManyToOne(() => Insurance, insurance => insurance.claims)
  insurance: Insurance;

  @Column()
  insuranceId: string;

  @Column({ type: 'enum', enum: ClaimStatus, default: ClaimStatus.DRAFT })
  status: ClaimStatus;

  @Column()
  submissionDate: Date;

  @Column({ nullable: true })
  responseDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  billedAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  allowedAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  adjustmentAmount: number;

  @Column({ type: 'json', nullable: true })
  claimData: any;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => Payment, payment => payment.claim)
  payments: Payment[];

  @OneToMany(() => ClaimDenial, denial => denial.claim)
  denials: ClaimDenial[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}