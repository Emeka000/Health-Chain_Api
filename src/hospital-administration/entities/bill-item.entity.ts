import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Bill } from './bill.entity';

export enum ItemType {
  CONSULTATION = 'consultation',
  PROCEDURE = 'procedure',
  MEDICINE = 'medicine',
  ROOM_CHARGE = 'room_charge',
  LAB_TEST = 'lab_test',
  EQUIPMENT_USAGE = 'equipment_usage',
  OTHER = 'other',
}

@Entity('bill_items')
export class BillItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: ItemType })
  type: ItemType;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'unit_price' })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'total_price' })
  totalPrice: number;

  @Column({ name: 'service_date' })
  serviceDate: Date;

  @Column({ name: 'bill_id' })
  billId: string;

  @ManyToOne(() => Bill, (bill) => bill.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bill_id' })
  bill: Bill;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
