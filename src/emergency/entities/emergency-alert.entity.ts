import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Emergency } from './emergency.entity';

@Entity('emergency_alerts')
export class EmergencyAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Emergency, (emergency) => emergency.alerts)
  @JoinColumn({ name: 'emergency_id' })
  emergency: Emergency;

  @Column()
  emergencyId: string;

  @Column()
  alertType: string; // 'critical', 'escalation', 'resource_shortage', 'delay'

  @Column('text')
  message: string;

  @Column()
  severity: string; // 'high', 'medium', 'low'

  @Column('boolean', { default: false })
  acknowledged: boolean;

  @Column({ nullable: true })
  acknowledgedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
