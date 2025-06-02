import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('system_health')
export class SystemHealth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'float' })
  cpuUsage: number;

  @Column({ type: 'float' })
  memoryUsage: number;

  @Column({ type: 'float' })
  diskUsage: number;

  @Column({ type: 'float' })
  networkLatency: number;

  @Column({ type: 'int' })
  activeConnections: number;

  @Column({ type: 'varchar' })
  status: 'healthy' | 'warning' | 'critical';

  @Column({ type: 'jsonb', nullable: true })
  additionalMetrics: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
