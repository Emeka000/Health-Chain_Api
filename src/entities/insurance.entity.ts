import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Patient } from './patient.entity';
import { Claim } from './claim.entity';

export enum InsuranceType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary'
}

export enum InsuranceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING_VERIFICATION = 'pending_verification',
  EXPIRED = 'expired'
}

@Entity('insurances')
export class Insurance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, patient => patient.insurances)
  patient: Patient;

  @Column()
  patientId: string;

  @Column()
  insuranceCompany: string;

  @Column()
  policyNumber: string;

  @Column()
  groupNumber: string;

  @Column()
  subscriberId: string;

  @Column()
  subscriberName: string;

  @Column({ type: 'enum', enum: InsuranceType })
  type: InsuranceType;

  @Column({ type: 'enum', enum: InsuranceStatus, default: InsuranceStatus.PENDING_VERIFICATION })
  status: InsuranceStatus;

  @Column()
  effectiveDate: Date;

  @Column({ nullable: true })
  expirationDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  copayAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  coinsurancePercent: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  deductibleAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  outOfPocketMax: number;

  @Column({ type: 'json', nullable: true })
  verificationDetails: any;

  @Column({ nullable: true })
  lastVerificationDate: Date;

  @OneToMany(() => Claim, claim => claim.insurance)
  claims: Claim[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
