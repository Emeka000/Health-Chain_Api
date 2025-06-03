import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { MedicalRecord } from './medical-record.entity';

export enum VersionChangeType {
  CREATED = 'created',
  UPDATED = 'updated',
  AMENDED = 'amended',
  STATUS_CHANGED = 'status_changed',
  ARCHIVED = 'archived',
}

@Entity('medical_record_versions')
export class MedicalRecordVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord, (record) => record.versions)
  @JoinColumn({ name: 'medicalRecordId' })
  medicalRecord: MedicalRecord;

  @Column({ type: 'integer' })
  versionNumber: number;

  @Column({ type: 'enum', enum: VersionChangeType })
  changeType: VersionChangeType;

  @Column({ type: 'json' })
  previousData: Record<string, any>;

  @Column({ type: 'json' })
  currentData: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  changes: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  changeReason: string;

  @Column({ type: 'uuid' })
  changedBy: string;

  @CreateDateColumn()
  createdAt: Date;
}
