import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ImagingStudy } from './imaging-study.entity';

@Entity()
export class RadiologyReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ImagingStudy, study => study.reports)
  study: ImagingStudy;

  @Column()
  reportNumber: string;

  @Column()
  status: 'draft' | 'preliminary' | 'final' | 'amended' | 'cancelled';

  @Column()
  reportType: 'routine' | 'stat' | 'addendum' | 'correction';

  @Column()
  radiologist: string;

  @Column({ type: 'text' })
  findings: string;

  @Column({ type: 'text' })
  impression: string;

  @Column({ type: 'json', nullable: true })
  measurements: {
    name: string;
    value: number;
    unit: string;
    location: string;
  }[];

  @Column({ type: 'json', nullable: true })
  recommendations: string[];

  @Column({ type: 'json', nullable: true })
  comparison: {
    studyDate: Date;
    studyDescription: string;
    findings: string;
  }[];

  @Column({ type: 'json', nullable: true })
  attachments: {
    type: string;
    url: string;
    description: string;
  }[];

  @Column()
  verifiedBy: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  reportDate: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  verificationDate: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 