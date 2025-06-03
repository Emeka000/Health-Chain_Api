import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('medical_devices')
export class MedicalDevice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  deviceId: string;

  @Column({ type: 'varchar', length: 255 })
  deviceName: string;

  @Column({ type: 'varchar', length: 100 })
  deviceType: string;

  @Column({ type: 'varchar', length: 255 })
  manufacturer: string;

  @Column({ type: 'varchar', length: 100 })
  model: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  serialNumber?: string;

  @Column({ type: 'text' })
  certificateHash: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastAuthenticated?: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  lastKnownIp?: string;

  @Column({ type: 'uuid' })
  associatedFacilityId: string;

  @CreateDateColumn()
  registeredAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  certificateExpiresAt?: Date;
}
