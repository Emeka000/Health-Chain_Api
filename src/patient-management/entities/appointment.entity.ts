import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, patient => patient.appointments)
  patient: Patient;

  @Column('uuid')
  patientId: string;

  @Column({ type: 'timestamp' })
  appointmentDateTime: Date;

  @Column({ default: 60 })
  duration: number; // in minutes

  @Column()
  type: string; // 'consultation', 'follow-up', 'procedure'

  @Column()
  status: string; // 'scheduled', 'confirmed', 'completed', 'cancelled'

  @Column({ nullable: true })
  providerId: string;

  @Column({ nullable: true })
  providerName: string;

  @Column({ nullable: true })
  reason: string;

  @Column('text', { nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
