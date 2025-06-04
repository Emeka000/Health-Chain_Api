import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { HealthRecord } from './health-record.entity';
import { Appointment } from './appointment.entity';
import { MedicationReminder } from './medication-reminder.entity';
import { HealthMetric } from './health-metric.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Billing } from './billing.entity';
import { Insurance } from './insurance.entity';

@Entity()
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  phoneNumber: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column()
  gender: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => HealthRecord, record => record.patient)
  healthRecords: HealthRecord[];

  @OneToMany(() => Appointment, appointment => appointment.patient)
  appointments: Appointment[];

  @OneToMany(() => MedicationReminder, reminder => reminder.patient)
  medicationReminders: MedicationReminder[];

  @OneToMany(() => HealthMetric, metric => metric.patient)
  healthMetrics: HealthMetric[];
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  patientId: string;

  @Column()
  dateOfBirth: Date;

  @Column()
  gender: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  socialSecurityNumber: string;

  @OneToMany(() => Billing, billing => billing.patient)
  billings: Billing[];

  @OneToMany(() => Insurance, insurance => insurance.patient)
  insurances: Insurance[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

