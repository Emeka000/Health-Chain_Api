import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum EquipmentStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  ERROR = 'error'
}

@Entity('lab_equipment')
export class LabEquipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  model: string;

  @Column()
  manufacturer: string;

  @Column()
  serialNumber: string;

  @Column({ type: 'enum', enum: EquipmentStatus, default: EquipmentStatus.OFFLINE })
  status: EquipmentStatus;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'json', nullable: true })
  capabilities: string[];

  @Column({ type: 'json', nullable: true })
  configuration: any;

  @Column({ type: 'timestamp', nullable: true })
  lastMaintenanceDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextMaintenanceDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastCalibrationDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  nextCalibrationDate: Date;

  @Column({ type: 'json', nullable: true })
  communicationSettings: {
    protocol: string;
    host: string;
    port: number;
    settings: any;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

