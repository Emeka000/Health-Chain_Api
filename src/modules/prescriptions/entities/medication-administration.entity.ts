import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../entities/user.entity';
import { Prescription } from './prescription.entity';

@Entity('medication_administrations')
export class MedicationAdministration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  prescriptionId: string;

  @ManyToOne(() => Prescription, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prescriptionId' })
  prescription: Prescription;

  @Column()
  patientId: string;

  @Column({ type: 'timestamp' })
  administeredAt: Date;

  @Column()
  administeredDose: string;

  @Column()
  administeredBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'administeredBy' })
  administrator: User;

  @Column({ nullable: true })
  notes: string;

  @Column({ default: false })
  wasRefused: boolean;

  @Column({ nullable: true })
  refusalReason: string;

  @Column({ default: false })
  wasOmitted: boolean;

  @Column({ nullable: true })
  omissionReason: string;

  @Column({ nullable: true })
  patientResponse: string;

  @Column({ nullable: true })
  adverseReaction: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
