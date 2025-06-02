import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MedicationAdministration } from './medication-administration.entity';
import { MedicationOrder } from './medication-order.entity';

@Entity()
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  medicalRecordNumber: string;

  @Column()
  dateOfBirth: Date;

  @Column({ nullable: true })
  allergies: string;

  @Column({ nullable: true })
  roomNumber: string;

  @OneToMany(() => MedicationOrder, (order) => order.patient)
  medicationOrders: MedicationOrder[];

  @OneToMany(() => MedicationAdministration, (admin) => admin.patient)
  administrations: MedicationAdministration[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
