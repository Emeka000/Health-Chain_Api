import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum LicenseStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  PENDING_RENEWAL = 'pending_renewal'
}

@Entity('medical_licenses')
export class MedicalLicense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  licenseNumber: string;

  @Column()
  licenseType: string; // Medical, Nursing, Pharmacy, etc.

  @Column()
  issuingState: string;

  @Column()
  issuedDate: Date;

  @Column()
  expirationDate: Date;

  @Column({
    type: 'enum',
    enum: LicenseStatus,
    default: LicenseStatus.ACTIVE
  })
  status: LicenseStatus;

  @Column({ nullable: true })
  verificationDate: Date;

  @Column({ nullable: true })
  verifiedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.medicalLicenses)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;
}import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

export enum LicenseStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  PENDING_RENEWAL = 'pending_renewal'
}

@Entity('medical_licenses')
export class MedicalLicense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  licenseNumber: string;

  @Column()
  licenseType: string; // Medical, Nursing, Pharmacy, etc.

  @Column()
  issuingState: string;

  @Column()
  issuedDate: Date;

  @Column()
  expirationDate: Date;

  @Column({
    type: 'enum',
    enum: LicenseStatus,
    default: LicenseStatus.ACTIVE
  })
  status: LicenseStatus;

  @Column({ nullable: true })
  verificationDate: Date;

  @Column({ nullable: true })
  verifiedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.medicalLicenses)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;
}