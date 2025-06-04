import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MedicalRecord } from './medical-record.entity';
import { Appointment } from './appointment.entity';
import { PatientCommunication } from './patient-communication.entity';
import { PatientConsent } from './patient-consent.entity';

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column()
  zipCode: string;

  @Column({ nullable: true })
  emergencyContactName: string;

  @Column({ nullable: true })
  emergencyContactPhone: string;

  @Column({ default: 'active' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => MedicalRecord, medicalRecord => medicalRecord.patient)
  medicalRecords: MedicalRecord[];

  @OneToMany(() => Appointment, appointment => appointment.patient)
  appointments: Appointment[];

  @OneToMany(() => PatientCommunication, communication => communication.patient)
  communications: PatientCommunication[];

  @OneToMany(() => PatientConsent, consent => consent.patient)
  consents: PatientConsent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
