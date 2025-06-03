import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ImagingStudy } from './imaging-study.entity';

@Entity()
export class ImagingEquipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  equipmentId: string;

  @Column()
  name: string;

  @Column()
  manufacturer: string;

  @Column()
  model: string;

  @Column()
  modality: 'CT' | 'MRI' | 'X-RAY' | 'ULTRASOUND' | 'PET' | 'SPECT';

  @Column()
  status: 'active' | 'maintenance' | 'inactive';

  @Column()
  location: string;

  @Column({ type: 'json' })
  specifications: {
    maxEnergy: number;
    resolution: string;
    detectorType: string;
    softwareVersion: string;
  };

  @Column({ type: 'json' })
  maintenanceSchedule: {
    lastMaintenance: Date;
    nextMaintenance: Date;
    maintenanceType: string;
    performedBy: string;
  }[];

  @Column({ type: 'json' })
  calibration: {
    lastCalibration: Date;
    nextCalibration: Date;
    calibrationType: string;
    performedBy: string;
  }[];

  @OneToMany(() => ImagingStudy, study => study.equipment)
  studies: ImagingStudy[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
} 