import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity()
export class MedicationReminder {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  medicationName: string;

  @Column()
  dosage: string;

  @Column()
  frequency: string; // 'daily', 'twice_daily', 'weekly', etc.

  @Column({ type: 'simple-array' })
  reminderTimes: string[]; // ['08:00', '20:00']

  @Column()
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  adherenceRate: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Patient, patient => patient.medicationReminders)
  patient: Patient;
}