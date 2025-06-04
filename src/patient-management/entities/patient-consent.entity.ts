import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity('patient_consents')
export class PatientConsent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, patient => patient.consents)
  patient: Patient;

  @Column('uuid')
  patientId: string;

  @Column()
  consentType: string; // 'treatment', 'data_sharing', 'marketing', 'research'

  @Column()
  status: string; // 'granted', 'denied', 'revoked'

  @Column('text')
  description: string;

  @Column({ type: 'timestamp' })
  grantedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  revokedAt: Date;

  @Column({ nullable: true })
  ipAddress: string;

  @Column('json', { nullable: true })
  metadata: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
