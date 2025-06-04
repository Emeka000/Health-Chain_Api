import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('medical_procedures')
export class MedicalProcedure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  physicianId: string;

  @Column()
  name: string;

  @Column()
  cptCode: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'datetime' })
  scheduledDate: Date;

  @Column({ type: 'datetime', nullable: true })
  completedDate: Date;

  @Column({ type: 'enum', enum: ['scheduled', 'in_progress', 'completed', 'cancelled'] })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'json', nullable: true })
  complications: object;

  @Column({ type: 'json', nullable: true })
  outcomes: object;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
