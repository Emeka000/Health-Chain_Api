import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { ScheduleType } from '../enums/schedule-type.enum';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  doctorId: string;

  @ManyToOne(() => Doctor, (doctor) => doctor.schedules)
  doctor: Doctor;

  @Column({ type: 'enum', enum: ScheduleType })
  scheduleType: ScheduleType;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  patientId: string; // For appointments

  @Column({ nullable: true })
  appointmentType: string; // e.g., 'Consultation', 'Surgery', 'Follow-up'

  @Column({ type: 'boolean', default: false })
  isRecurring: boolean;

  @Column({ type: 'jsonb', nullable: true })
  recurrencePattern: {
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
    interval: number;
    endDate?: Date;
    daysOfWeek?: number[]; // 0-6, Sunday = 0
  };

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  isCancelled: boolean;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
