import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Billing } from './billing.entity';

export enum CodeType {
  CPT = 'cpt',
  ICD10 = 'icd10',
  HCPCS = 'hcpcs'
}

@Entity('billing_codes')
export class BillingCode {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Billing, billing => billing.billingCodes)
  billing: Billing;

  @Column()
  billingId: string;

  @Column({ type: 'enum', enum: CodeType })
  codeType: CodeType;

  @Column()
  code: string;

  @Column()
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ default: 1 })
  quantity: number;

  @Column({ nullable: true })
  modifiers: string;

  @CreateDateColumn()
  createdAt: Date;
}
