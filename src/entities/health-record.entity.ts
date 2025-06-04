import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Patient } from './patient.entity';

@Entity()
export class HealthRecord {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string; // 'diagnosis', 'treatment', 'lab_result', 'prescription'

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ nullable: true })
  providerId: number;

  @CreateDateColumn()
  recordDate: Date;

  @ManyToOne(() => Patient, patient => patient.healthRecords)
  patient: Patient;
}
