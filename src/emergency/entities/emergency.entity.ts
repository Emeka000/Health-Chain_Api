import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { EmergencyAlert } from './emergency-alert.entity';
import { EmergencyResource } from './emergency-resources.entity';
import { EmergencyDocumentation } from './emergency-documentation.entity';

export enum TriageLevel {
  RESUSCITATION = 1, // Immediate - Life threatening
  EMERGENT = 2, // Within 15 minutes
  URGENT = 3, // Within 30 minutes
  LESS_URGENT = 4, // Within 1 hour
  NON_URGENT = 5, // Within 2 hours
}

export enum EmergencyStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  DISCHARGED = 'discharged',
  ADMITTED = 'admitted',
  TRANSFERRED = 'transferred',
}

export enum ResourceType {
  BED = 'bed',
  VENTILATOR = 'ventilator',
  DEFIBRILLATOR = 'defibrillator',
  MONITOR = 'monitor',
  WHEELCHAIR = 'wheelchair',
  STRETCHER = 'stretcher',
}

@Entity('emergencies')
export class Emergency {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  patientName: string;

  @Column()
  age: number;

  @Column()
  gender: string;

  @Column('text')
  chiefComplaint: string;

  @Column('text')
  symptoms: string;

  @Column({
    type: 'enum',
    enum: TriageLevel,
    default: TriageLevel.NON_URGENT,
  })
  triageLevel: TriageLevel;

  @Column({
    type: 'enum',
    enum: EmergencyStatus,
    default: EmergencyStatus.PENDING,
  })
  status: EmergencyStatus;

  @Column('text', { nullable: true })
  triageNotes: string;

  @Column({ nullable: true })
  assignedNurse: string;

  @Column({ nullable: true })
  assignedDoctor: string;

  @Column({ nullable: true })
  bedNumber: string;

  @Column('json', { nullable: true })
  vitalSigns: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
  };

  @Column('simple-array', { nullable: true })
  allergies: string[];

  @Column('json', { nullable: true })
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;

  @Column({ type: 'timestamp', nullable: true })
  triageTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  treatmentStartTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  dischargeTime: Date;

  @Column('int', { default: 0 })
  waitTimeMinutes: number;

  @Column('boolean', { default: false })
  isEscalated: boolean;

  @Column('text', { nullable: true })
  escalationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => EmergencyAlert, (alert) => alert.emergency)
  alerts: EmergencyAlert[];

  @OneToMany(() => EmergencyResource, (resource) => resource.emergency)
  resources: EmergencyResource[];

  @OneToMany(() => EmergencyDocumentation, (doc) => doc.emergency)
  documentation: EmergencyDocumentation[];
}
