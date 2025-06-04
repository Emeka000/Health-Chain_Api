import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity('appointments')
@Index(['appointmentDate', 'status']) // Optimize appointment scheduling
@Index(['doctorId', 'appointmentDate'])
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  patientId: number;

  @Column()
  doctorId: number;

  @Column()
  appointmentDate: Date;

  @Column()
  duration: number; // in minutes

  @Column()
  type: string; // 'consultation', 'follow_up', 'surgery', 'test'

  @Column({ default: 'scheduled' })
  status: string; // 'scheduled', 'in_progress', 'completed', 'cancelled'

  @Column('text', { nullable: true })
  notes: string;

  @Column('json', { nullable: true })
  vitals: object;

  @ManyToOne(() => Patient, patient => patient.appointments)
  patient: Patient;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
