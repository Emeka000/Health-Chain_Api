import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { Patient } from './patient.entity';
import { MedicalLicense } from './medical-license.entity';

export enum UserRole {
  PATIENT = 'patient',
  NURSE = 'nurse',
  DOCTOR = 'doctor',
  SPECIALIST = 'specialist',
  ADMIN = 'admin',
  PHARMACIST = 'pharmacist',
  TECHNICIAN = 'technician',
  RECEPTIONIST = 'receptionist'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.PATIENT
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION
  })
  status: UserStatus;

  @Column({ nullable: true })
  employeeId: string;

  @Column({ nullable: true })
  department: string;

  @Column({ type: 'json', nullable: true })
  permissions: string[];

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @Column({ nullable: true })
  deactivatedAt: Date;

  @Column({ nullable: true })
  deactivatedBy: string;

  @Column({ nullable: true })
  deactivationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => Patient, patient => patient.user, { nullable: true })
  patient: Patient;

  @OneToMany(() => MedicalLicense, license => license.user)
  medicalLicenses: MedicalLicense[];
}
