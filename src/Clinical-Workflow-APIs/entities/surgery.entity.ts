import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('surgeries')
export class Surgery {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  surgeonId: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'datetime' })
  scheduledDate: Date;

  @Column({ type: 'datetime', nullable: true })
  startTime: Date;

  @Column({ type: 'datetime', nullable: true })
  endTime: Date;

  @Column({ type: 'enum', enum: ['scheduled', 'pre_op', 'in_progress', 'completed', 'cancelled'] })
  status: string;

  @Column({ type: 'text', nullable: true })
  preOpNotes: string;

  @Column({ type: 'text', nullable: true })
  postOpNotes: string;

  @Column({ type: 'json', nullable: true })
  complications: object;

  @Column({ type: 'json' })
  team: object;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
