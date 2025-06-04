import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity('medical_records')
export class MedicalRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, patient => patient.medicalRecords)
  patient: Patient;

  @Column('uuid')
  patientId: string;

  @Column()
  recordType: string; // 'diagnosis', 'prescription', 'lab_result', 'visit_note'

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'date' })
  recordDate: Date;

  @Column({ nullable: true })
  providerId: string;

  @Column({ nullable: true })
  providerName: string;

  @Column('json', { nullable: true })
  metadata: any;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}