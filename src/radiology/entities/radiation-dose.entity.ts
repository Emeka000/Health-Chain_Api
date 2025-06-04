import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ImagingStudy } from './imaging-study.entity';

@Entity()
export class RadiationDose {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ImagingStudy, study => study.radiationDoses)
  study: ImagingStudy;

  @Column('decimal', { precision: 10, scale: 4 })
  doseAreaProduct: number;

  @Column('decimal', { precision: 10, scale: 4 })
  effectiveDose: number;

  @Column('decimal', { precision: 10, scale: 4 })
  entranceSkinDose: number;

  @Column('decimal', { precision: 10, scale: 4 })
  organDose: number;

  @Column()
  exposureTime: number;

  @Column()
  tubeCurrent: number;

  @Column()
  tubeVoltage: number;

  @Column()
  filterType: string;

  @Column()
  beamQuality: string;

  @Column({ type: 'json' })
  organDoses: {
    organ: string;
    dose: number;
    unit: string;
  }[];

  @Column({ type: 'json' })
  exposureParameters: {
    kvp: number;
    ma: number;
    exposureTime: number;
    distance: number;
    fieldSize: string;
  };

  @Column()
  safetyStatus: 'within-limits' | 'exceeding-limits' | 'critical';

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  recordedAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 