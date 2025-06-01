import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { InventoryItem } from './inventory-item.entity';
import { PrescriptionItem } from './prescription-item.entity';


export enum DrugSchedule {
  NON_CONTROLLED = 'NON_CONTROLLED',
  SCHEDULE_I = 'SCHEDULE_I',
  SCHEDULE_II = 'SCHEDULE_II',
  SCHEDULE_III = 'SCHEDULE_III',
  SCHEDULE_IV = 'SCHEDULE_IV',
  SCHEDULE_V = 'SCHEDULE_V'
}

export enum DosageForm {
  TABLET = 'TABLET',
  CAPSULE = 'CAPSULE',
  LIQUID = 'LIQUID',
  INJECTION = 'INJECTION',
  CREAM = 'CREAM',
  INHALER = 'INHALER'
}

@Entity('drugs')
export class Drug {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 11 })
  ndcCode: string; // National Drug Code (11-digit format)

  @Column({ length: 200 })
  brandName: string;

  @Column({ length: 200 })
  genericName: string;

  @Column({ length: 100 })
  manufacturer: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  strength: number;

  @Column({ length: 50 })
  strengthUnit: string; // mg, ml, etc.

  @Column({ type: 'enum', enum: DosageForm })
  dosageForm: DosageForm;

  @Column({ type: 'enum', enum: DrugSchedule, default: DrugSchedule.NON_CONTROLLED })
  schedule: DrugSchedule;

  @Column({ type: 'text', array: true, default: [] })
  activeIngredients: string[];

  @Column({ type: 'text', array: true, default: [] })
  indications: string[];

  @Column({ type: 'text', array: true, default: [] })
  contraindications: string[];

  @Column({ type: 'text', array: true, default: [] })
  sideEffects: string[];

  @Column({ type: 'text', array: true, default: [] })
  interactions: string[]; // Drug interaction codes/names

  @Column({ type: 'text', array: true, default: [] })
  allergyTriggers: string[]; // Common allergy triggers

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPrice: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => InventoryItem, item => item.drug)
  inventoryItems: InventoryItem[];

  @OneToMany(() => PrescriptionItem, item => item.drug)
  prescriptionItems: PrescriptionItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
