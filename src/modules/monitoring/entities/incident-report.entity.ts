import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('incident_reports')
export class IncidentReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  incidentType: 'system_error' | 'data_breach' | 'equipment_failure' | 'patient_safety' | 'other';

  @Column({ type: 'varchar' })
  severity: 'low' | 'medium' | 'high' | 'critical';

  @Column({ type: 'varchar' })
  status: 'reported' | 'investigating' | 'resolved' | 'closed';

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb' })
  impact: {
    affectedSystems?: string[];
    affectedPatients?: string[];
    affectedStaff?: string[];
    businessImpact?: string;
  };

  @Column({ type: 'jsonb' })
  timeline: {
    detectedAt: Date;
    reportedAt: Date;
    investigationStartedAt?: Date;
    resolvedAt?: Date;
    closedAt?: Date;
  };

  @Column({ type: 'jsonb', nullable: true })
  investigation: {
    rootCause?: string;
    findings?: string[];
    recommendations?: string[];
    preventiveMeasures?: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  resolution: {
    actionsTaken?: string[];
    verificationSteps?: string[];
    lessonsLearned?: string[];
  };

  @Column({ type: 'varchar' })
  reportedBy: string;

  @Column({ type: 'varchar', nullable: true })
  assignedTo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 