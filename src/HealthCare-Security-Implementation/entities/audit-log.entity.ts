import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('audit_logs')
@Index(['userId', 'timestamp'])
@Index(['action', 'timestamp'])
@Index(['patientId', 'timestamp'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 100 })
  userRole: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ type: 'varchar', length: 255 })
  resource: string;

  @Column({ type: 'uuid', nullable: true })
  patientId?: string;

  @Column({ type: 'varchar', length: 45 })
  ipAddress: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent?: string;

  @Column({ type: 'text', nullable: true })
  details?: string;

  @Column({ type: 'boolean', default: false })
  successful: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reason?: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sessionId?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  deviceId?: string;
}
