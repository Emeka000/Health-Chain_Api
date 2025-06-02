import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Emergency } from './emergency.entity';

@Entity('emergency_documentation')
export class EmergencyDocumentation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Emergency, (emergency) => emergency.documentation)
  @JoinColumn({ name: 'emergency_id' })
  emergency: Emergency;

  @Column()
  emergencyId: string;

  @Column()
  documentType: string; // 'triage_note', 'treatment_note', 'discharge_summary'

  @Column('text')
  content: string;

  @Column()
  authorId: string;

  @Column()
  authorName: string;

  @Column()
  authorRole: string; // 'nurse', 'doctor', 'technician'

  @CreateDateColumn()
  createdAt: Date;
}
