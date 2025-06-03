import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TemplateType {
  SOAP = 'soap', // Subjective, Objective, Assessment, Plan
  ADMISSION = 'admission',
  DISCHARGE = 'discharge',
  PROGRESS = 'progress',
  CONSULTATION = 'consultation',
  PROCEDURE = 'procedure',
  NURSING = 'nursing',
}

@Entity('clinical_note_templates')
export class ClinicalNoteTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'enum', enum: TemplateType })
  type: TemplateType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  specialty: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json' })
  structure: {
    sections: Array<{
      id: string;
      title: string;
      type: 'text' | 'select' | 'multiselect' | 'number' | 'date' | 'textarea';
      required: boolean;
      options?: string[];
      validation?: Record<string, any>;
    }>;
  };

  @Column({ type: 'text', nullable: true })
  template: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'uuid' })
  createdBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
