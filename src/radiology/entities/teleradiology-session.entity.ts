import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ImagingStudy } from './imaging-study.entity';

@Entity()
export class TeleradiologySession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ImagingStudy, study => study.teleradiologySessions)
  study: ImagingStudy;

  @Column()
  sessionId: string;

  @Column()
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';

  @Column()
  remoteRadiologist: string;

  @Column()
  remoteLocation: string;

  @Column()
  connectionType: 'secure-vpn' | 'dedicated-line' | 'cloud-platform';

  @Column({ type: 'json' })
  connectionDetails: {
    protocol: string;
    encryption: string;
    bandwidth: string;
    latency: number;
  };

  @Column({ type: 'json' })
  viewerSettings: {
    windowLevel: number;
    windowWidth: number;
    zoom: number;
    pan: { x: number; y: number };
    annotations: any[];
  };

  @Column({ type: 'json' })
  collaboration: {
    participants: string[];
    chatHistory: {
      timestamp: Date;
      user: string;
      message: string;
    }[];
    annotations: {
      timestamp: Date;
      user: string;
      type: string;
      data: any;
    }[];
  };

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
} 