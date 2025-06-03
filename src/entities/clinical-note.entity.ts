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
import { ClinicalNoteTemplate } from './clinical-note-template.entity';

@Entity('clinical_notes')
export class ClinicalNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  medicalRecordId: string;

  @ManyToOne(() => MedicalRecord, (record) => record.clinicalNotes)
  @JoinColumn({ name: 'medicalRecordId' })
  medicalRecord: MedicalRecord;

  @Column({ type: 'uuid', nullable: true })
  templateId: string;

  @ManyToOne(() => ClinicalNoteTemplate, { nullable: true })
  @JoinColumn({ name: 'templateId' })
  template: ClinicalNoteTemplate;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'json', nullable: true })
  structuredContent: Record<string, any>;

  @Column({ type: 'varchar', length: 50 })
  noteType: string;

  @Column({ type: 'uuid' })
  authorId: string;

  @Column({ type: 'boolean', default: false })
  isSigned: boolean;

  @Column({ type: 'timestamp', nullable: true })
  signedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
