import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Drug } from './drug.entity';

export enum TransactionType {
  RECEIVED = 'RECEIVED',
  DISPENSED = 'DISPENSED',
  RETURNED = 'RETURNED',
  DESTROYED = 'DESTROYED',
  TRANSFERRED = 'TRANSFERRED',
}

@Entity('controlled_substance_logs')
export class ControlledSubstanceLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Drug, (drug) => drug.inventoryItems)
  drug: Drug;

  @Column()
  drugId: string;

  @Column({ type: 'enum', enum: TransactionType })
  transactionType: TransactionType;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  runningBalance: number;

  @Column({ nullable: true })
  prescriptionId: string;

  @Column({ nullable: true })
  patientId: string;

  @Column()
  pharmacistId: string;

  @Column({ length: 50, nullable: true })
  deaNumber: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  transactionDate: Date;
}
