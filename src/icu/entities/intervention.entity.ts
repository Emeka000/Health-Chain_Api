import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IcuPatient } from './icu-patient.entity';

@Entity()
export class Intervention {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => IcuPatient, patient => patient.interventions)
  patient: IcuPatient;

  @Column()
  type: 'procedure' | 'treatment' | 'assessment' | 'emergency';

  @Column()
  description: string;

  @Column()
  performedBy: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  performedAt: Date;

  @Column()
  outcome: 'successful' | 'partial' | 'unsuccessful';

  @Column({ nullable: true })
  complications: string;

  @Column({ nullable: true })
  notes: string;

  @Column()
  priority: 'routine' | 'urgent' | 'emergency';

  @Column({ type: 'json', nullable: true })
  additionalData: Record<string, any>;
} 