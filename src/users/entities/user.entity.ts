import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';
import { MonitoringData } from '../../monitoring/entities/monitoring-data.entity';
import { Prescription } from '../../prescriptions/entities/prescription.entity';

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  ADMIN = 'admin',
}

@Entity()
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

  @Column({ type: 'enum', enum: UserRole, default: UserRole.PATIENT })
  role: UserRole;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  medicalLicenseNumber: string;

  @Column({ nullable: true })
  specialization: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Appointment, appointment => appointment.patient)
  patientAppointments: Appointment[];

  @OneToMany(() => Appointment, appointment => appointment.doctor)
  doctorAppointments: Appointment[];

  @OneToMany(() => MonitoringData, data => data.patient)
  monitoringData: MonitoringData[];

  @OneToMany(() => Prescription, prescription => prescription.patient)
  prescriptions: Prescription[];
}
