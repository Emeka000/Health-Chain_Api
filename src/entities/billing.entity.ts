import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { BillingCode } from './billing-code.entity';
import { Claim } from './claim.entity';

export enum BillingStatus {
  DRAFT = 'draft',
  READY_TO_SUBMIT = 'ready_to_submit',
  SUBMITTED = 'submitted',
  PAID = 'paid',
  DENIED = 'denied',
  PARTIALLY_PAID = 'partially_paid'
}

@Entity('billings')
export class Billing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, patient => patient.billings)
  patient: Patient;

  @Column()
  patientId: string;

  @Column()
  serviceDate: Date;

  @Column()
  providerId: string;

  @Column()
  facilityId: string;

  @Column({ type: 'enum', enum: BillingStatus, default: BillingStatus.DRAFT })
  status: BillingStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  adjustmentAmount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => BillingCode, billingCode => billingCode.billing, { cascade: true })
  billingCodes: BillingCode[];

  @OneToMany(() => Claim, claim => claim.billing)
  claims: Claim[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
