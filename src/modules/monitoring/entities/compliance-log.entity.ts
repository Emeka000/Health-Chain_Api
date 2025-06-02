import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('compliance_logs')
export class ComplianceLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  complianceType: 'hipaa' | 'hitech' | 'gdpr' | 'local' | 'other';

  @Column({ type: 'varchar' })
  status: 'compliant' | 'non_compliant' | 'warning';

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb' })
  requirements: {
    standard: string;
    section: string;
    requirement: string;
    details?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  evidence: {
    documentId?: string;
    documentType?: string;
    verificationMethod?: string;
    verifiedBy?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  remediation: {
    actionRequired?: string;
    actionTaken?: string;
    dueDate?: Date;
    completedDate?: Date;
  };

  @Column({ type: 'varchar', nullable: true })
  assignedTo: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 