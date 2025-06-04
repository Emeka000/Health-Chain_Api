import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('clinical_alerts')
export class ClinicalAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  triggeredBy: string;

  @Column()
  type: string;

  @Column()
  severity: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'json' })
  data: object;

  @Column({ type: 'boolean', default: false })
  acknowledged: boolean;

  @Column({ nullable: true })
  acknowledgedBy: string;

  @Column({ type: 'datetime', nullable: true })
  acknowledgedAt: Date;

  @Column({ type: 'datetime', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
