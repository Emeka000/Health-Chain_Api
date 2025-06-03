import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PathologyCase } from './pathology-case.entity';
import { Doctor } from '../../doctors/entities/doctor.entity';

export enum ReportStatus {
  DRAFT = 'draft',
  PRELIMINARY = 'preliminary',
  FINAL = 'final',
  AMENDED = 'amended',
  CORRECTED = 'corrected'
}

export enum DiagnosisType {
  BENIGN = 'benign',
  MALIGNANT = 'malignant',
  SUSPICIOUS = 'suspicious',
  INFLAMMATORY = 'inflammatory',
  REACTIVE = 'reactive',
  NORMAL = 'normal',
  INADEQUATE = 'inadequate'
}

@Entity('pathology_reports')
export class PathologyReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  reportNumber: string;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.DRAFT
  })
  status: ReportStatus;

  @Column('text')
  macroscopicDescription: string;

  @Column('text')
  microscopicDescription: string;

  @Column('text')
  diagnosis: string;

  @Column({
    type: 'enum',
    enum: DiagnosisType
  })
  diagnosisType: DiagnosisType;

  @Column('text', { nullable: true })
  comments: string;

  @Column('text', { nullable: true })
  recommendations: string;

  @Column('simple-json', { nullable: true })
  immunohistochemistry: {
    markers: Array<{
      name: string;
      result: string;
      intensity: string;
      distribution: string;
    }>;
    interpretation: string;
  };

  @Column('simple-json', { nullable: true })
  molecularFindings: {
    mutations: Array<{
      gene: string;
      variant: string;
      significance: string;
    }>;
    biomarkers: Array<{
      name: string;
      status: string;
      value: string;
    }>;
  };

  @Column('simple-json', { nullable: true })
  stagingInformation: {
    tnmStaging: {
      t: string;
      n: string;
      m: string;
      stage: string;
    };
    gradingSystem: string;
    grade: string;
  };

  @Column('simple-json', { nullable: true })
  specialStains: Array<{
    stainName: string;
    result: string;
    interpretation: string;
  }>;

  @Column()
  reportDate: Date;

  @Column({ nullable: true })
  verifiedDate: Date;

  @Column({ default: false })
  isVerified: boolean;

  @Column('text', { nullable: true })
  templateUsed: string;

  @Column('simple-json', { nullable: true })
  additionalTesting: {
    flowCytometry: string;
    cytogenetics: string;
    molecularTesting: string;
    otherTests: string[];
  };

  @ManyToOne(() => PathologyCase, pathologyCase => pathologyCase.reports)
  pathologyCase: PathologyCase;

  @ManyToOne(() => Doctor, doctor => doctor.authoredReports)
  author: Doctor;

  @ManyToOne(() => Doctor, doctor => doctor.verifiedReports)
  verifiedBy: Doctor;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}