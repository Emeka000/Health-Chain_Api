import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MedicalRecord } from './medical-record.entity';
import { Patient } from './patient.entity';

export enum ConsentType {
  TREATMENT = 'treatment',
  SHARING = 'sharing',
  RESEARCH = 'research',
  DISCLOSURE = 'disclosure',
  COMMUNICATION = 'communication',
}

export enum ConsentStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  WITHDRAWN = 'withdrawn',
  EXPIRED = 'expired',
}

@Entity('medical_record_consents')
export class MedicalRecordConsent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({ type: 'uuid', nullable: true })
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord, (record) => record.consents, {
    nullable: true,
  })
  @JoinColumn({ name: 'medicalRecordId' })
  medicalRecord: MedicalRecord;

  @Column({ type: 'enum', enum: ConsentType })
  consentType: ConsentType;

  @Column({ type: 'enum', enum: ConsentStatus })
  status: ConsentStatus;

  @Column({ type: 'varchar', length: 255 })
  purpose: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', array: true, default: [] })
  authorizedParties: string[];

  @Column({ type: 'varchar', array: true, default: [] })
  dataTypes: string[];

  @Column({ type: 'timestamp' })
  grantedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  withdrawnAt: Date;

  @Column({ type: 'text', nullable: true })
  withdrawalReason: string;

  @Column({ type: 'json', nullable: true })
  restrictions: Record<string, any>;

  @Column({ type: 'boolean', default: false })
  isElectronic: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  witnessName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  witnessSignature: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
