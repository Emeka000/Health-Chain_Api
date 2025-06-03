import { LabResult } from 'src/lab/entities/lab-result.entity';
import { Patient } from 'src/mar/entities/patient.entity';
import { Doctor } from 'src/medical-staff/entities/doctor.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum LabOrderStatus {
  PENDING = 'pending',
  COLLECTED = 'collected',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum LabOrderPriority {
  ROUTINE = 'routine',
  URGENT = 'urgent',
  STAT = 'stat'
}

@Entity('lab_orders')
export class LabOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  orderNumber: string;

  @ManyToOne(() => Patient)
  patient: Patient;

  @Column()
  patientId: string;

  @ManyToOne(() => Doctor)
  orderingPhysician: Doctor;

  @Column()
  orderingPhysicianId: string;

  @Column({ type: 'enum', enum: LabOrderStatus, default: LabOrderStatus.PENDING })
  status: LabOrderStatus;

  @Column({ type: 'enum', enum: LabOrderPriority, default: LabOrderPriority.ROUTINE })
  priority: LabOrderPriority;

  @Column({ type: 'timestamp', nullable: true })
  collectionDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  expectedCompletionDate: Date;

  @Column({ type: 'text', nullable: true })
  clinicalNotes: string;

  @Column({ type: 'text', nullable: true })
  patientInstructions: string;

  @OneToMany(() => LabResult, result => result.labOrder)
  results: LabResult[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
    workflows: any;
}
