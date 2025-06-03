import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('clinical_alerts')
export class ClinicalAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  alertType: 'patient' | 'medication' | 'equipment' | 'system' | 'compliance';

  @Column({ type: 'varchar' })
  severity: 'low' | 'medium' | 'high' | 'critical';

  @Column({ type: 'varchar' })
  status: 'active' | 'acknowledged' | 'resolved';

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  patientData: {
    patientId?: string;
    patientName?: string;
    roomNumber?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    source: string;
    location?: string;
    department?: string;
    assignedTo?: string;
  };

  @Column({ type: 'timestamp', nullable: true })
  acknowledgedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
