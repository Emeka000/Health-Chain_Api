import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class EmergencyOverrideLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  patientId: string;

  @Column()
  reason: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column({ default: false })
  reviewed: boolean;
}
