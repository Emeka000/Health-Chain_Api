import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn
  } from 'typeorm';
  import { MedicalRecord } from './medical-record.entity';
  
  export enum AttachmentType {
    IMAGE = 'image',
    DOCUMENT = 'document',
    LAB_RESULT = 'lab_result',
    XRAY = 'xray',
    MRI = 'mri',
    CT_SCAN = 'ct_scan',
    ULTRASOUND = 'ultrasound',
    ECG = 'ecg',
    PRESCRIPTION = 'prescription',
    REFERRAL = 'referral'
  }
  
  @Entity('medical_attachments')
  export class MedicalAttachment {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'uuid' })
    medicalRecordId: string;
  
    @ManyToOne(() => MedicalRecord, record => record.attachments)
    @JoinColumn({ name: 'medicalRecordId' })
    medicalRecord: MedicalRecord;
  
    @Column({ type: 'enum', enum: AttachmentType })
    type: AttachmentType;
  
    @Column({ type: 'varchar', length: 255 })
    fileName: string;
  
    @Column({ type: 'varchar', length: 255 })
    originalFileName: string;
  
    @Column({ type: 'varchar', length: 100 })
    mimeType: string;
  
    @Column({ type: 'integer' })
    fileSize: number;
  
    @Column({ type: 'varchar', length: 500 })
    filePath: string;
  
    @Column({ type: 'varchar', length: 500, nullable: true })
    thumbnailPath: string;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;
  
    @Column({ type: 'boolean', default: false })
    isEncrypted: boolean;
  
    @Column({ type: 'varchar', length: 64, nullable: true })
    checksum: string;
  
    @Column({ type: 'uuid' })
    uploadedBy: string;
  
    @CreateDateColumn()
    createdAt: Date;
  }
  