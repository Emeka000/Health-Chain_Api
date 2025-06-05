import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum InfectionType {
  HAI = 'healthcare-associated',
  CAI = 'community-acquired',
  SURGICAL_SITE = 'surgical-site',
  BLOODSTREAM = 'bloodstream',
  PNEUMONIA = 'pneumonia',
  UTI = 'urinary-tract'
}

export enum InfectionStatus {
  SUSPECTED = 'suspected',
  CONFIRMED = 'confirmed',
  RESOLVED = 'resolved',
  MONITORING = 'monitoring'
}

@Entity('infections')
export class Infection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column({ type: 'enum', enum: InfectionType })
  type: InfectionType;

  @Column({ type: 'enum', enum: InfectionStatus })
  status: InfectionStatus;

  @Column()
  pathogen: string;

  @Column({ nullable: true })
  sourceLocation: string;

  @Column({ type: 'date' })
  onsetDate: Date;

  @Column({ type: 'date', nullable: true })
  diagnosisDate: Date;

  @Column({ type: 'text', nullable: true })
  riskFactors: string;

  @Column({ type: 'text', nullable: true })
  clinicalNotes: string;

  @Column({ default: false })
  isOutbreakRelated: boolean;

  @Column({ nullable: true })
  outbreakId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
