import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DocumentationType, Priority } from '../../../common/enums';
import { Nurse } from '../../nurses/entities/nurse.entity';
import { Patient } from '../../patients/entities/patient.entity';

@Entity('documentation')
export class Documentation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nurseId: string;

  @Column()
  patientId: string;

  @Column({
    type: 'enum',
    enum: DocumentationType,
  })
  documentationType: DocumentationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority: Priority;

  @Column({ type: 'json', nullable: true })
  vitalSigns: {
    temperature?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    painLevel?: number;
    weight?: number;
    height?: number;
  };

  @Column({ type: 'json', nullable: true })
  medications: {
    name: string;
    dosage: string;
    route: string;
    frequency: string;
    timeAdministered: string;
    nurseInitials: string;
    patientResponse?: string;
  }[];

  @Column({ type: 'timestamp' })
  documentedAt: Date;

  @Column({ default: false })
  isAmended: boolean;

  @Column({ type: 'text', nullable: true })
  amendmentReason: string;

  @Column({ default: false })
  requiresPhysicianReview: boolean;

  @Column({ default: false })
  isReviewed: boolean;

  @ManyToOne(() => Nurse, (nurse) => nurse.documentation)
  @JoinColumn({ name: 'nurseId' })
  nurse: Nurse;

  @ManyToOne(() => Patient, (patient) => patient.documentation)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
