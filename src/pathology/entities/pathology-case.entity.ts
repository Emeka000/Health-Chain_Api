import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';
import { PathologyReport } from './pathology-report.entity';
import { PathologyImage } from './pathology-image.entity';
import { QualityAssurance } from './quality-assurance.entity';

export enum CaseStatus {
  RECEIVED = 'received',
  IN_PROGRESS = 'in_progress',
  REVIEWED = 'reviewed',
  COMPLETED = 'completed',
  ARCHIVED = 'archived'
}

export enum CaseType {
  HISTOLOGY = 'histology',
  CYTOLOGY = 'cytology',
  MOLECULAR = 'molecular',
  GENETIC = 'genetic',
  IMMUNOHISTOCHEMISTRY = 'immunohistochemistry',
  FLOW_CYTOMETRY = 'flow_cytometry'
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
  STAT = 'stat'
}

@Entity('pathology_cases')
export class PathologyCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  caseNumber: string;

  @Column({
    type: 'enum',
    enum: CaseType
  })
  caseType: CaseType;

  @Column({
    type: 'enum',
    enum: CaseStatus,
    default: CaseStatus.RECEIVED
  })
  status: CaseStatus;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.NORMAL
  })
  priority: Priority;

  @Column('text')
  clinicalHistory: string;

  @Column('text')
  specimenDescription: string;

  @Column()
  collectionDate: Date;

  @Column()
  receivedDate: Date;

  @Column({ nullable: true })
  expectedCompletionDate: Date;

  @Column({ nullable: true })
  completedDate: Date;

  @Column('simple-json', { nullable: true })
  specimenDetails: {
    site: string;
    procedure: string;
    fixative: string;
    containerType: string;
    quantity: number;
    grossDescription: string;
  };

  @Column('simple-json', { nullable: true })
  clinicalData: {
    symptoms: string[];
    previousDiagnosis: string;
    medications: string[];
    relevantHistory: string;
  };

  @ManyToOne(() => Patient, patient => patient.pathologyCases)
  patient: Patient;

  @ManyToOne(() => Doctor, doctor => doctor.requestedPathologyCases)
  requestingDoctor: Doctor;

  @ManyToOne(() => Doctor, doctor => doctor.reviewedPathologyCases)
  pathologist: Doctor;

  @OneToMany(() => PathologyReport, (report: PathologyReport) => report.pathologyCase)
  reports: PathologyReport[];

  @OneToMany(() => PathologyImage, (image: PathologyImage) => image.pathologyCase)
  images: PathologyImage[];

  @OneToMany(() => QualityAssurance, (qa: QualityAssurance) => qa.pathologyCase)
  qualityAssurances: QualityAssurance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}