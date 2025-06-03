import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../../entities/user.entity';
import { Prescription } from './prescription.entity';

export enum InteractionSeverity {
  CONTRAINDICATION = 'CONTRAINDICATION',
  SEVERE = 'SEVERE',
  MODERATE = 'MODERATE',
  MILD = 'MILD',
  UNKNOWN = 'UNKNOWN',
}

export enum InteractionType {
  DRUG_DRUG = 'DRUG_DRUG',
  DRUG_ALLERGY = 'DRUG_ALLERGY',
  DRUG_CONDITION = 'DRUG_CONDITION',
  DUPLICATE_THERAPY = 'DUPLICATE_THERAPY',
  DOSE_CHECK = 'DOSE_CHECK',
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  OVERRIDDEN = 'OVERRIDDEN',
  RESOLVED = 'RESOLVED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
}

@Entity('drug_interaction_alerts')
export class DrugInteractionAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column({
    type: 'enum',
    enum: InteractionType,
  })
  interactionType: InteractionType;

  @Column({
    type: 'enum',
    enum: InteractionSeverity,
  })
  severity: InteractionSeverity;

  @Column()
  description: string;

  @Column({ nullable: true })
  evidenceText: string;

  @Column({ nullable: true })
  recommendedAction: string;

  @Column({
    type: 'enum',
    enum: AlertStatus,
    default: AlertStatus.ACTIVE,
  })
  status: AlertStatus;

  @ManyToMany(() => Prescription)
  @JoinTable({
    name: 'drug_interaction_prescriptions',
    joinColumn: { name: 'alertId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'prescriptionId', referencedColumnName: 'id' },
  })
  relatedPrescriptions: Prescription[];

  @Column({ nullable: true })
  overriddenBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'overriddenBy' })
  overriddenByUser: User;

  @Column({ nullable: true })
  overrideReason: string;

  @Column({ type: 'timestamp', nullable: true })
  overriddenAt: Date;

  @Column({ default: false })
  requiresAcknowledgment: boolean;

  @Column({ nullable: true })
  acknowledgedBy: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'acknowledgedBy' })
  acknowledgedByUser: User;

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
