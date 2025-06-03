import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Appointment } from './appointment.entity';
import { User } from '../../../entities/user.entity';

@Entity('consultation_notes')
export class ConsultationNote {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Appointment, { eager: true })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ name: 'appointment_id' })
  appointmentId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'provider_id' })
  provider: User;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ type: 'text' })
  notes: string;

  @Column({ type: 'json', nullable: true })
  vitalSigns: {
    temperature?: number;
    heartRate?: number;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
    weight?: number;
    height?: number;
    bmi?: number;
    pain?: number;
  };

  @Column({ type: 'text', nullable: true })
  subjective: string;

  @Column({ type: 'text', nullable: true })
  objective: string;

  @Column({ type: 'text', nullable: true })
  assessment: string;

  @Column({ type: 'text', nullable: true })
  plan: string;

  @Column({ type: 'json', nullable: true })
  diagnoses: {
    code: string;
    description: string;
    type: string;
  }[];

  @Column({ type: 'json', nullable: true })
  medications: {
    name: string;
    dosage: string;
    frequency: string;
    route: string;
    duration: string;
    instructions: string;
  }[];

  @Column({ type: 'json', nullable: true })
  labTests: {
    name: string;
    reason: string;
    urgency: string;
    instructions: string;
  }[];

  @Column({ type: 'json', nullable: true })
  procedures: {
    name: string;
    reason: string;
    instructions: string;
  }[];

  @Column({ type: 'json', nullable: true })
  referrals: {
    specialty: string;
    reason: string;
    urgency: string;
    notes: string;
  }[];

  @Column({ type: 'text', nullable: true })
  patientEducation: string;

  @Column({ type: 'text', nullable: true })
  followUpInstructions: string;

  @Column({ nullable: true })
  followUpDate: Date;

  @Column({ default: false })
  followUpScheduled: boolean;

  @Column({ nullable: true })
  followUpAppointmentId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;
}
