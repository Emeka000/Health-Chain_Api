import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class SurgicalCase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  procedureType: string;

  @Column()
  urgency: 'low' | 'medium' | 'high';

  @Column({ type: 'timestamp' })
  scheduledAt: Date;

  @Column({ default: 'pending' })
  status: 'pending' | 'completed' | 'cancelled';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

