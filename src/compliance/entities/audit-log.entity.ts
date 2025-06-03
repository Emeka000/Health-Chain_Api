import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Index,
  } from 'typeorm';
  import { Regulation } from './regulation.entity';
  
  export enum AuditEventType {
    ACCESS = 'access',
    MODIFICATION = 'modification',
    DELETION = 'deletion',
    EXPORT = 'export',
    PRINT = 'print',
    LOGIN = 'login',
    LOGOUT = 'logout',
    FAILED_LOGIN = 'failed_login',
    PERMISSION_CHANGE = 'permission_change',
    DATA_BREACH = 'data_breach',
    POLICY_VIOLATION = 'policy_violation',
  }
  
  export enum AuditSeverity {
    CRITICAL = 'critical',
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
    INFO = 'info',
  }
  
  @Entity('audit_logs')
  @Index(['userId', 'eventType', 'timestamp'])
  @Index(['resourceType', 'resourceId', 'timestamp'])
  @Index(['severity', 'timestamp'])
  export class AuditLog {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ name: 'user_id', nullable: true })
    userId?: number;
  
    @Column({ name: 'session_id', nullable: true })
    sessionId?: string;
  
    @Column({
      type: 'enum',
      enum: AuditEventType,
    })
    eventType: AuditEventType;
  
    @Column({
      type: 'enum',
      enum: AuditSeverity,
      default: AuditSeverity.INFO,
    })
    severity: AuditSeverity;
  
    @Column({ name: 'resource_type' })
    resourceType: string;
  
    @Column({ name: 'resource_id', nullable: true })
    resourceId?: string;
  
    @Column({ name: 'regulation_id', nullable: true })
    regulationId?: number;
  
    @Column('text')
    description: string;
  
    @Column({ name: 'ip_address' })
    ipAddress: string;
  
    @Column({ name: 'user_agent', nullable: true })
    userAgent?: string;
  
    @Column({ type: 'json', nullable: true })
    metadata?: Record<string, any>;
  
    @Column({ name: 'phi_accessed', default: false })
    phiAccessed: boolean;
  
    @Column({ name: 'patient_id', nullable: true })
    patientId?: number;
  
    @Column({ default: false })
    suspicious: boolean;
  
    @Column({ name: 'risk_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
    riskScore?: number;
  
    @ManyToOne(() => Regulation, regulation => regulation.auditLogs)
    @JoinColumn({ name: 'regulation_id' })
    regulation?: Regulation;
  
    @CreateDateColumn({ name: 'timestamp' })
    timestamp: Date;
  }