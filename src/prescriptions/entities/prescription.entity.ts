import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum PrescriptionStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FILLED = 'filled',
  CANCELLED = 'cancelled',
}

@Entity()
export class Prescription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.prescriptions)
  patient: User;

  @ManyToOne(() => User)
  prescriber: User;

  @Column()
  medicationName: string;

  @Column()
  dosage: string;

  @Column()
  frequency: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int', nullable: true })
  refills: number;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'enum', enum: PrescriptionStatus, default: PrescriptionStatus.PENDING })
  status: PrescriptionStatus;

  @Column({ nullable: true })
  pharmacyName: string;

  @Column({ nullable: true })
  pharmacyPhone: string;

  @Column({ type: 'datetime', nullable: true })
  sentAt: Date;

  @Column({ type: 'datetime', nullable: true })
  filledAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
