import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ConfigType {
  SYSTEM = 'system',
  BILLING = 'billing',
  SECURITY = 'security',
  NOTIFICATION = 'notification',
  INTEGRATION = 'integration',
  BUSINESS = 'business',
}

@Entity('system_configurations')
export class SystemConfiguration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column('text')
  value: string;

  @Column({ type: 'enum', enum: ConfigType })
  type: ConfigType;

  @Column('text', { nullable: true })
  description: string;

  @Column({ name: 'is_sensitive', default: false })
  isSensitive: boolean;

  @Column({ name: 'is_editable', default: true })
  isEditable: boolean;

  @Column({ name: 'validation_rule', nullable: true })
  validationRule: string;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
