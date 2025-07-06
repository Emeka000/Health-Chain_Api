import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  ACCESS_ATTEMPT = 'ACCESS_ATTEMPT',
  EXPORT = 'EXPORT',
  PRINT = 'PRINT',
  BACKUP = 'BACKUP',
  RESTORE = 'RESTORE',
}

export enum AuditResult {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  WARNING = 'WARNING',
}

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['entityType', 'entityId', 'createdAt'])
@Index(['action', 'createdAt'])
@Index(['ipAddress', 'createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  @Index()
  userId: string;

  
  @Column()
  patientId: string;

  @Column()
  action: string;

  @Column()
  ipAddress: string;

  @Column({ nullable: true })
  username: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
  })
  action: AuditAction;

  @Column({
    type: 'enum',
    enum: AuditResult,
  })
  result: AuditResult;

  @Column({ nullable: true })
  entityType: string;

  @Column({ nullable: true })
  entityId: string;

  @Column({ type: 'jsonb', nullable: true })
  oldValues: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  newValues: Record<string, any>;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column({ nullable: true })
  sessionId: string;

  @Column({ nullable: true })
  endpoint: string;

  @Column({ nullable: true })
  httpMethod: string;

  @Column({ nullable: true })
  statusCode: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  additionalData: Record<string, any>;

  @Column({ default: false })
  isPHIAccess: boolean;

  @Column({ nullable: true })
  phiType: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'bigint', default: () => 'EXTRACT(EPOCH FROM NOW())' })
  timestamp: number;
}
