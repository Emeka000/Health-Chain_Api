import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { IsEnum, IsOptional, IsString, IsDate, IsNumber } from 'class-validator';

export enum IncidentSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum IncidentStatus {
  REPORTED = 'reported',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum IncidentType {
  MEDICATION_ERROR = 'medication_error',
  FALL = 'fall',
  INFECTION = 'infection',
  EQUIPMENT_FAILURE = 'equipment_failure',
  COMMUNICATION = 'communication',
  OTHER = 'other'
}

@Entity('incident_reports')
export class IncidentReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: IncidentType })
  type: IncidentType;

  @Column({ type: 'enum', enum: IncidentSeverity })
  severity: IncidentSeverity;

  @Column({ type: 'enum', enum: IncidentStatus, default: IncidentStatus.REPORTED })
  status: IncidentStatus;

  @Column({ nullable: true })
  patientId: string;

  @Column({ nullable: true })
  departmentId: string;

  @Column()
  reportedBy: string;

  @Column({ type: 'timestamp' })
  incidentDate: Date;

  @Column({ nullable: true })
  assignedTo: string;

  @OneToMany(() => RootCauseAnalysis, rca => rca.incident)
  rootCauseAnalyses: RootCauseAnalysis[];

  @OneToMany(() => CorrectiveAction, ca => ca.incident)
  correctiveActions: CorrectiveAction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
