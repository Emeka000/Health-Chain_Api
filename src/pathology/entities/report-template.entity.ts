import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Doctor } from '../../doctors/entities/doctor.entity';

export enum TemplateType {
  HISTOLOGY = 'histology',
  CYTOLOGY = 'cytology',
  MOLECULAR = 'molecular',
  GENETIC = 'genetic',
  IMMUNOHISTOCHEMISTRY = 'immunohistochemistry',
  AUTOPSY = 'autopsy',
  FROZEN_SECTION = 'frozen_section'
}

export enum TemplateStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  UNDER_REVIEW = 'under_review'
}

@Entity('report_templates')
export class ReportTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  version: string;

  @Column({
    type: 'enum',
    enum: TemplateType
  })
  templateType: TemplateType;

  @Column({
    type: 'enum',
    enum: TemplateStatus,
    default: TemplateStatus.DRAFT
  })
  status: TemplateStatus;

  @Column('text')
  description: string;

  @Column('simple-json')
  templateStructure: {
    sections: Array<{
      id: string;
      name: string;
      required: boolean;
      order: number;
      fields: Array<{
        id: string;
        name: string;
        type: string;
        required: boolean;
        options?: string[];
        defaultValue?: string;
        validation?: string;
      }>;
    }>;
  };

  @Column('simple-json', { nullable: true })
  macroscopicTemplate: {
    sections: string[];
    requiredFields: string[];
    standardPhrases: string[];
  };

  @Column('simple-json', { nullable: true })
  microscopicTemplate: {
    sections: string[];
    requiredFields: string[];
    standardPhrases: string[];
    gradingSystems: string[];
  };

  @Column('simple-json', { nullable: true })
  diagnosisTemplate: {
    categories: string[];
    modifiers: string[];
    stagingSystems: string[];
    requiredElements: string[];
  };

  @Column('simple-json', { nullable: true })
  synopticReporting: {
    cancerType: string;
    protocol: string;
    requiredDataElements: Array<{
      element: string;
      type: string;
      options: string[];
      required: boolean;
    }>;
  };

  @Column('simple-json', { nullable: true })
  standardizedPhrases: {
    macroscopic: string[];
    microscopic: string[];
    diagnosis: string[];
    comments: string[];
  };

  @Column('simple-json', { nullable: true })
  validationRules: Array<{
    field: string;
    rule: string;
    message: string;
  }>;

  @Column({ default: 0 })
  usageCount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  effectiveDate: Date;

  @Column({ nullable: true })
  expirationDate: Date;

  @ManyToOne(() => Doctor, doctor => doctor.createdTemplates)
  createdBy: Doctor;

  @ManyToOne(() => Doctor, doctor => doctor.approvedTemplates)
  approvedBy: Doctor;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}