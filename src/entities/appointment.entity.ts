import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  appointmentDate: Date;

  @Column()
  duration: number; // in minutes

  @Column()
  status: string; // 'scheduled', 'confirmed', 'completed', 'cancelled'

  @Column()
  providerId: number;

  @Column()
  providerName: string;

  @Column({ nullable: true })
  location: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Patient, patient => patient.appointments)
  patient: Patient;
}
