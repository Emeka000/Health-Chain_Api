import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { AppointmentStatus } from '../enums/appointment-status.enum';
import { AppointmentType } from '../enums/appointment-type.enum';
import { MedicalPriority } from '../enums/medical-priority.enum';
import { Patient } from '../../patients/entities/patient.entity';
import { User } from '../../../entities/user.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, { eager: true })
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @Column({ name: 'patient_id' })
  patientId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'provider_id' })
  provider: User;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ type: 'timestamp' })
  startDateTime: Date;

  @Column({ type: 'timestamp' })
  endDateTime: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.PROPOSED,
  })
  status: AppointmentStatus;

  @Column({
    type: 'enum',
    enum: AppointmentType,
    default: AppointmentType.ROUTINE,
  })
  appointmentType: AppointmentType;

  @Column({
    type: 'enum',
    enum: MedicalPriority,
    default: MedicalPriority.MEDIUM,
  })
  medicalPriority: MedicalPriority;

  @Column({ nullable: true })
  reasonForVisit: string;

  @Column({ nullable: true })
  chiefComplaint: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: false })
  isTelemedicine: boolean;

  @Column({ nullable: true })
  telemedicineUrl: string;

  @Column({ nullable: true })
  telemedicineAccessCode: string;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  roomNumber: string;

  @Column({ default: false })
  reminderSent: boolean;

  @Column({ nullable: true })
  reminderSentAt: Date;

  @Column({ default: false })
  followUpRequired: boolean;

  @Column({ nullable: true })
  followUpDate: Date;

  @Column({ nullable: true })
  followUpNotes: string;

  @Column({ nullable: true })
  cancellationReason: string;

  @Column({ nullable: true })
  cancellationDate: Date;

  @Column({ nullable: true })
  cancelledBy: string;

  @Column({ type: 'json', nullable: true })
  consultationOutcome: {
    diagnosis: string;
    treatment: string;
    prescriptions: string[];
    labTests: string[];
    followUpInstructions: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  confirmationNumber: string;

  /**
   * Calculate the duration of the appointment in minutes
   */
  get durationMinutes(): number {
    return Math.round(
      (this.endDateTime.getTime() - this.startDateTime.getTime()) / (1000 * 60),
    );
  }

  /**
   * Check if the appointment is upcoming
   */
  get isUpcoming(): boolean {
    return this.startDateTime > new Date();
  }

  /**
   * Check if the appointment is in progress
   */
  get isInProgress(): boolean {
    const now = new Date();
    return this.startDateTime <= now && this.endDateTime >= now;
  }

  /**
   * Check if the appointment is completed
   */
  get isCompleted(): boolean {
    return (
      this.status === AppointmentStatus.COMPLETED ||
      this.status === AppointmentStatus.FULFILLED
    );
  }
}
