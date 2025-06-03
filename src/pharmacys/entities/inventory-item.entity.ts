import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Drug } from './drug.entity';

@Entity('inventory_items')
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Drug, (drug) => drug.inventoryItems)
  drug: Drug;

  @Column()
  drugId: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  reorderLevel: number;

  @Column({ type: 'int' })
  maxLevel: number;

  @Column({ length: 50 })
  lotNumber: string;

  @Column({ type: 'date' })
  expirationDate: Date;

  @Column({ length: 100 })
  supplier: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costPerUnit: number;

  @Column({ length: 100, nullable: true })
  location: string; // Storage location in pharmacy

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
