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

export enum AllergySeverity {
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  SEVERE = 'SEVERE',
  LIFE_THREATENING = 'LIFE_THREATENING',
  UNKNOWN = 'UNKNOWN',
}

export enum AllergyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  RESOLVED = 'RESOLVED',
}

@Entity('patient_medication_allergies')
export class PatientMedicationAllergy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  substance: string;

  @Column({ nullable: true })
  substanceClass: string;

  @Column({
    type: 'enum',
    enum: AllergySeverity,
    default: AllergySeverity.UNKNOWN,
  })
  severity: AllergySeverity;

  @Column({
    type: 'enum',
    enum: AllergyStatus,
    default: AllergyStatus.ACTIVE,
  })
  status: AllergyStatus;

  @Column({ nullable: true })
  reaction: string;

  @Column({ type: 'timestamp', nullable: true })
  onsetDate: Date;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  source: string;

  @Column()
  recordedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'recordedBy' })
  recorder: User;

  @Column({ nullable: true })
  updatedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'updatedBy' })
  updater: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
