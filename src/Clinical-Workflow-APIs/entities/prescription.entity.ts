import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { Medication } from './medication.entity';

@Entity('prescriptions')
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  physicianId: string;

  @Column()
  dosage: string;

  @Column()
  frequency: string;

  @Column()
  duration: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'integer', default: 0 })
  refills: number;

  @Column({ type: 'date' })
  prescribedDate: Date;

  @Column({ type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ type: 'enum', enum: ['active', 'filled', 'expired', 'cancelled'] })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Medication, medication => medication.prescriptions)
  medication: Medication;
}