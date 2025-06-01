import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    VersionColumn
  } from 'typeorm';
  import { Patient } from './patient.entity';
  import { Doctor } from './doctor.entity';
  import { MedicalRecordVersion } from './medical-record-version.entity';
  import { ClinicalNote } from './clinical-note.entity';
  import { MedicalAttachment } from './medical-attachment.entity';
  import { MedicalRecordConsent } from './medical-record-consent.entity';
  
  export enum RecordType {
    CONSULTATION = 'consultation',
    DIAGNOSIS = 'diagnosis',
    TREATMENT = 'treatment',
    SURGERY = 'surgery',
    PRESCRIPTION = 'prescription',
    LAB_RESULT = 'lab_result',
    IMAGING = 'imaging',
    DISCHARGE_SUMMARY = 'discharge_summary'
  }
  
  export enum RecordStatus {
    DRAFT = 'draft',
    ACTIVE = 'active',
    AMENDED = 'amended',
    ARCHIVED = 'archived',
    DELETED = 'deleted'
  }
  
  @Entity('medical_records')
  @Index(['patientId', 'recordType'])
  @Index(['patientId', 'createdAt'])
  @Index(['doctorId', 'createdAt'])
  export class MedicalRecord {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'varchar', length: 100 })
    recordNumber: string;
  
    @Column({ type: 'enum', enum: RecordType })
    recordType: RecordType;
  
    @Column({ type: 'enum', enum: RecordStatus, default: RecordStatus.DRAFT })
    status: RecordStatus;
  
    @Column({ type: 'varchar', length: 255 })
    title: string;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @Column({ type: 'json', nullable: true })
    structuredData: Record<string, any>;
  
    @Column({ type: 'json', nullable: true })
    vitalSigns: {
      temperature?: number;
      bloodPressure?: { systolic: number; diastolic: number };
      heartRate?: number;
      respiratoryRate?: number;
      oxygenSaturation?: number;
      weight?: number;
      height?: number;
      bmi?: number;
    };
  
    @Column({ type: 'varchar', array: true, default: [] })
    symptoms: string[];
  
    @Column({ type: 'varchar', array: true, default: [] })
    diagnoses: string[];
  
    @Column({ type: 'varchar', array: true, default: [] })
    treatments: string[];
  
    @Column({ type: 'varchar', array: true, default: [] })
    medications: string[];
  
    @Column({ type: 'varchar', array: true, default: [] })
    allergies: string[];
  
    @Column({ type: 'text', nullable: true })
    clinicalImpression: string;
  
    @Column({ type: 'text', nullable: true })
    treatmentPlan: string;
  
    @Column({ type: 'text', nullable: true })
    followUpInstructions: string;
  
    @Column({ type: 'timestamp', nullable: true })
    encounterDate: Date;
  
    @Column({ type: 'varchar', length: 50, nullable: true })
    encounterType: string;
  
    @Column({ type: 'boolean', default: false })
    isConfidential: boolean;
  
    @Column({ type: 'varchar', array: true, default: [] })
    accessRestictions: string[];
  
    @VersionColumn()
    version: number;
  
    @Column({ type: 'uuid', nullable: true })
    parentRecordId: string;
  
    @ManyToOne(() => MedicalRecord, { nullable: true })
    @JoinColumn({ name: 'parentRecordId' })
    parentRecord: MedicalRecord;
  
    @OneToMany(() => MedicalRecord, record => record.parentRecord)
    childRecords: MedicalRecord[];
  
    @Column({ type: 'uuid' })
    patientId: string;
  
    @ManyToOne(() => Patient, patient => patient.medicalRecords)
    @JoinColumn({ name: 'patientId' })
    patient: Patient;
  
    @Column({ type: 'uuid' })
    doctorId: string;
  
    @ManyToOne(() => Doctor, doctor => doctor.medicalRecords)
    @JoinColumn({ name: 'doctorId' })
    doctor: Doctor;
  
    @OneToMany(() => MedicalRecordVersion, version => version.medicalRecord)
    versions: MedicalRecordVersion[];
  
    @OneToMany(() => ClinicalNote, note => note.medicalRecord)
    clinicalNotes: ClinicalNote[];
  
    @OneToMany(() => MedicalAttachment, attachment => attachment.medicalRecord)
    attachments: MedicalAttachment[];
  
    @OneToMany(() => MedicalRecordConsent, consent => consent.medicalRecord)
    consents: MedicalRecordConsent[];
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @Column({ type: 'uuid' })
    createdBy: string;
  
    @Column({ type: 'uuid', nullable: true })
    lastModifiedBy: string;
  }