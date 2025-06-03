import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AccreditationStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}

@Entity('lab_accreditations')
export class LabAccreditation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accreditingBody: string;

  @Column()
  certificateNumber: string;

  @Column({ type: 'enum', enum: AccreditationStatus })
  status: AccreditationStatus;

  @Column({ type: 'date' })
  issuedDate: Date;

  @Column({ type: 'date' })
  expiryDate: Date;

  @Column({ type: 'json' })
  scope: string[];

  @Column({ type: 'json', nullable: true })
  requirements: any;

  @Column({ type: 'json', nullable: true })
  complianceChecks: any;

  @Column({ type: 'timestamp', nullable: true })
  lastAuditDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextAuditDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}