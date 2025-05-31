import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('equipment_health')
export class EquipmentHealth {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  equipmentId: string;

  @Column({ type: 'varchar' })
  equipmentType: string;

  @Column({ type: 'varchar' })
  status: 'operational' | 'maintenance' | 'warning' | 'critical' | 'offline';

  @Column({ type: 'jsonb' })
  metrics: {
    uptime: number;
    lastMaintenance: Date;
    nextMaintenance: Date;
    batteryLevel?: number;
    temperature?: number;
    pressure?: number;
    flowRate?: number;
    otherMetrics?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  maintenanceHistory: {
    lastServiceDate: Date;
    serviceType: string;
    technician: string;
    findings: string[];
    recommendations: string[];
  }[];

  @Column({ type: 'jsonb', nullable: true })
  calibration: {
    lastCalibrated: Date;
    nextCalibrationDue: Date;
    calibrationStatus: 'valid' | 'expired' | 'pending';
    calibrationCertificate?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  location: {
    department: string;
    room: string;
    floor: string;
    building: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  alerts: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
    resolved: boolean;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 