import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Patient } from './patient.entity';
import { Medication } from './medication.entity';

export enum SeverityLevel {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe',
  LIFE_THREATENING = 'life_threatening',
}

export enum ReactionStatus {
  ACTIVE = 'active',
  RESOLVED = 'resolved',
  ONGOING = 'ongoing',
}

@Entity()
export class AdverseDrugReaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Patient)
  patient: Patient;

  @ManyToOne(() => Medication)
  medication: Medication;

  @Column()
  reaction: string;

  @Column({ type: 'enum', enum: SeverityLevel })
  severity: SeverityLevel;

  @Column({
    type: 'enum',
    enum: ReactionStatus,
    default: ReactionStatus.ACTIVE,
  })
  status: ReactionStatus;

  @Column()
  onsetDate: Date;

  @Column({ nullable: true })
  resolvedDate: Date;

  @Column({ nullable: true })
  description: string;

  @Column()
  reporterId: string;

  @Column()
  reporterName: string;

  @Column({ default: false })
  reportedToPhysician: boolean;

  @Column({ nullable: true })
  physicianNotifiedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
