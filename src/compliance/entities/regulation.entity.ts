import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ComplianceRequirement } from './compliance-requirement.entity';
import { AuditLog } from './audit-log.entity';

export enum RegulationType {
  HIPAA = 'hipaa',
  HITECH = 'hitech',
  FDA = 'fda',
  CMS = 'cms',
  OSHA = 'osha',
  JOINT_COMMISSION = 'joint_commission',
  STATE_SPECIFIC = 'state_specific',
  CUSTOM = 'custom',
}

export enum RegulationStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  DEPRECATED = 'deprecated',
  UNDER_REVIEW = 'under_review',
}

@Entity('regulations')
@Index(['type', 'status'])
@Index(['effectiveDate', 'expirationDate'])
export class Regulation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: RegulationType,
  })
  type: RegulationType;

  @Column({
    type: 'enum',
    enum: RegulationStatus,
    default: RegulationStatus.ACTIVE,
  })
  status: RegulationStatus;

  @Column({ name: 'effective_date' })
  effectiveDate: Date;

  @Column({ name: 'expiration_date', nullable: true })
  expirationDate?: Date;

  @Column({ name: 'regulatory_body' })
  regulatoryBody: string;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Column()
  version: string;

  @Column({ name: 'last_updated_by' })
  lastUpdatedBy: number;

  @OneToMany(
    () => ComplianceRequirement,
    (requirement) => requirement.regulation,
  )
  requirements: ComplianceRequirement[];

  @OneToMany(() => AuditLog, (auditLog) => auditLog.regulation)
  auditLogs: AuditLog[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
