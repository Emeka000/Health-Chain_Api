import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum IncidentStatus {
  OPEN = 'OPEN',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

@Entity('security_incidents')
export class SecurityIncident {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: IncidentSeverity })
  severity: IncidentSeverity;

  @Column({ type: 'enum', enum: IncidentStatus })
  status: IncidentStatus;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'uuid', nullable: true })
  affectedUserId?: string;

  @Column({ type: 'uuid', nullable: true })
  affectedPatientId?: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  sourceIpAddress?: string;

  @Column({ type: 'text', nullable: true })
  technicalDetails?: string;

  @Column({ type: 'boolean', default: false })
  breachOccurred: boolean;

  @Column({ type: 'boolean', default: false })
  notificationSent: boolean;

  @Column({ type: 'timestamp', nullable: true })
  breachNotificationDeadline?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  assignedTo?: string;

  @Column({ type: 'text', nullable: true })
  resolutionNotes?: string;
}