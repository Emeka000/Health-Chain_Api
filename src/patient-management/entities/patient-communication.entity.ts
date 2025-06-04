import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity('patient_communications')
export class PatientCommunication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient, patient => patient.communications)
  patient: Patient;

  @Column('uuid')
  patientId: string;

  @Column()
  type: string; // 'email', 'sms', 'call', 'letter'

  @Column()
  subject: string;

  @Column('text')
  content: string;

  @Column()
  status: string; // 'sent', 'delivered', 'read', 'failed'

  @Column({ nullable: true })
  sentBy: string;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
