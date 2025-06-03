import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Patient } from './patient.entity';
import { MedicalRecord } from './medical-record.entity';

export enum TimelineEventType {
  DIAGNOSIS = 'diagnosis',
  TREATMENT = 'treatment',
  MEDICATION = 'medication',
  SURGERY = 'surgery',
  HOSPITALIZATION = 'hospitalization',
  VACCINATION = 'vaccination',
  ALLERGY = 'allergy',
  VITAL_SIGN = 'vital_sign',
  LAB_RESULT = 'lab_result',
  IMAGING = 'imaging',
}

@Entity('medical_timeline')
@Index(['patientId', 'eventDate'])
@Index(['patientId', 'eventType'])
export class MedicalTimeline {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column({ type: 'uuid', nullable: true })
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord, { nullable: true })
  @JoinColumn({ name: 'medicalRecordId' })
  medicalRecord: MedicalRecord;

  @Column({ type: 'enum', enum: TimelineEventType })
  eventType: TimelineEventType;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  eventData: Record<string, any>;

  @Column({ type: 'timestamp' })
  eventDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'varchar', length: 50, nullable: true })
  severity: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  status: string;

  @Column({ type: 'boolean', default: false })
  isOngoing: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
