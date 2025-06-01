import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Prescription } from './prescription.entity';
import { Drug } from './drug.entity';

@Entity('prescription_items')
export class PrescriptionItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Prescription, prescription => prescription.items)
  prescription: Prescription;

  @Column()
  prescriptionId: string;

  @ManyToOne(() => Drug, drug => drug.prescriptionItems)
  drug: Drug;

  @Column()
  drugId: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int', nullable: true })
  daysSupply: number;

  @Column({ type: 'int', default: 0 })
  refillsRemaining: number;

  @Column({ type: 'text' })
  instructions: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}