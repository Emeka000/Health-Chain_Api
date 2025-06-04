import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MedicalRecord } from './medical-record.entity';
import { Appointment } from './appointment.entity';

@Entity('patients')
@Index(['medicalRecordNumber'], { unique: true })
@Index(['lastName', 'firstName']) // Optimize patient searches
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  medicalRecordNumber: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  dateOfBirth: Date;

  @Column()
  phoneNumber: string;

  @Column()
  email: string;

  @Column('text', { nullable: true })
  address: string;

  @Column({ default: 'active' })
  status: string;

  @Column('json', { nullable: true })
  emergencyContact: object;

  @Column('json', { nullable: true })
  insuranceInfo: object;

  @OneToMany(() => MedicalRecord, record => record.patient, { lazy: true })
  medicalRecords: MedicalRecord[];

  @OneToMany(() => Appointment, appointment => appointment.patient, { lazy: true })
  appointments: Appointment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}