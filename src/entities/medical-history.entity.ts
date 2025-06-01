import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn
  } from 'typeorm';
  import { Patient } from './patient.entity';
  
  export enum HistoryType {
    FAMILY = 'family',
    PERSONAL = 'personal',
    SOCIAL = 'social',
    SURGICAL = 'surgical',
    MEDICATION = 'medication',
    ALLERGY = 'allergy'
  }
  
  @Entity('medical_history')
  export class MedicalHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'uuid' })
    patientId: string;
  
    @ManyToOne(() => Patient)
    @JoinColumn({ name: 'patientId' })
    patient: Patient;
  
    @Column({ type: 'enum', enum: HistoryType })
    historyType: HistoryType;
  
    @Column({ type: 'varchar', length: 255 })
    condition: string;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @Column({ type: 'varchar', length: 255, nullable: true })
    relationship: string; // For family history
  
    @Column({ type: 'date', nullable: true })
    onsetDate: Date;
  
    @Column({ type: 'date', nullable: true })
    resolvedDate: Date;
  
    @Column({ type: 'varchar', length: 50, nullable: true })
    severity: string;
  
    @Column({ type: 'boolean', default: true })
    isActive: boolean;
  
    @Column({ type: 'json', nullable: true })
    additionalInfo: Record<string, any>;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }