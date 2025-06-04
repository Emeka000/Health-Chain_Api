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
import { Patient } from '../../../modules/patients/entities/patient.entity';
import { User } from '../../../entities/user.entity';
import { Medication } from '../../../mar/entities/medication.entity';
import { PrescriptionStatus } from '../enums/prescription-status.enum';
import { MedicationRoute } from '../enums/medication-route.enum';
import { Pharmacy } from './pharmacy.entity';
import { MedicationAdministration } from './medication-administration.entity';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Core Prescription Information
  @Column()
  patientId: string;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patientId' })
  patient: Patient;

  @Column()
  prescribingProviderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'prescribingProviderId' })
  prescribingProvider: User;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  issueDate: Date;

  @Column({
    type: 'enum',
    enum: PrescriptionStatus,
    default: PrescriptionStatus.PENDING_APPROVAL,
  })
  status: PrescriptionStatus;

  // Medication Details
  @Column({ nullable: true })
  medicationId: string;

  @ManyToOne(() => Medication, { nullable: true })
  @JoinColumn({ name: 'medicationId' })
  medication: Medication;

  @Column()
  medicationName: string;

  @Column()
  strength: string;

  @Column()
  dosageForm: string;

  @Column()
  quantity: number;

  @Column()
  quantityUnit: string;

  // Administration Instructions
  @Column({
    type: 'enum',
    enum: MedicationRoute,
  })
  route: MedicationRoute;

  @Column()
  frequency: string;

  @Column({ nullable: true })
  timingInstructions: string;

  @Column({ nullable: true })
  durationDays: number;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  prnReason: string;

  @Column({ nullable: true })
  maxDosePerPeriod: string;

  // Refills and Dispensing
  @Column({ default: 0 })
  refillsAllowed: number;

  @Column({ default: 0 })
  refillsRemaining: number;

  @Column({ default: false })
  dispenseAsWritten: boolean;

  @Column({ nullable: true })
  pharmacyId: string;

  @ManyToOne(() => Pharmacy, (pharmacy) => pharmacy.prescriptions, { nullable: true })
  @JoinColumn({ name: 'pharmacyId' })
  pharmacy: Pharmacy;

  @Column({ nullable: true })
  pharmacyNotes: string;
  
  @OneToMany(() => MedicationAdministration, (administration) => administration.prescription)
  administrations: MedicationAdministration[];

  // Safety and Compliance
  @Column('simple-array', { nullable: true })
  allergiesNoted: string[];

  @Column({ default: false })
  contraindicationsChecked: boolean;

  @Column({ nullable: true })
  drugInteractionsAlertId: string;

  // Workflow and Audit
  @Column({ nullable: true })
  authorizingPharmacistId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'authorizingPharmacistId' })
  authorizingPharmacist: User;

  @Column({ type: 'timestamp', nullable: true })
  verificationTimestamp: Date;

  @Column({ nullable: true })
  cancellationReason: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  source: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  creator: User;

  @Column()
  updatedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updatedBy' })
  updater: User;
}
