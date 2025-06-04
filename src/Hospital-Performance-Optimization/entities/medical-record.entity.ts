import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, CreateDateColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity('medical_records')
@Index(['patientId', 'recordDate']) // Optimize medical record queries
@Index(['recordType'])
export class MedicalRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  patientId: number;

  @Column()
  recordType: string; // 'diagnosis', 'treatment', 'lab_result', 'vital_signs'

  @Column('json')
  data: object;

  @Column()
  recordDate: Date;

  @Column({ nullable: true })
  doctorId: number;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ default: 'active' })
  status: string;

  @ManyToOne(() => Patient, patient => patient.medicalRecords)
  patient: Patient;

  @CreateDateColumn()
  createdAt: Date;
}
