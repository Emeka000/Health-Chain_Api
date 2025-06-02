import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { MedicationOrder } from './medication-order.entity';

@Entity()
export class Medication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  genericName: string;

  @Column({ unique: true })
  barcode: string;

  @Column()
  strength: string;

  @Column()
  dosageForm: string; // tablet, capsule, injection, etc.

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ nullable: true })
  ndc: string; // National Drug Code

  @OneToMany(() => MedicationOrder, (order) => order.medication)
  orders: MedicationOrder[];
}
