import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Emergency, ResourceType } from './emergency.entity';

@Entity('emergency_resources')
export class EmergencyResource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Emergency, (emergency) => emergency.resources)
  @JoinColumn({ name: 'emergency_id' })
  emergency: Emergency;

  @Column()
  emergencyId: string;

  @Column({
    type: 'enum',
    enum: ResourceType,
  })
  resourceType: ResourceType;

  @Column()
  resourceId: string;

  @Column()
  resourceName: string;

  @Column({ type: 'timestamp' })
  allocatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  releasedAt: Date;

  @Column('boolean', { default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
