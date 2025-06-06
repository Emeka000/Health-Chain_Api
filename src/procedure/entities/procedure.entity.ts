import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('medical_procedures')
export class MedicalProcedure {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  treatmentPlanId: string;

  @Column()
  procedureName: string;

  @Column()
  scheduledAt: Date;

  @Column({ default: false })
  isCompleted: boolean;

  @Column('text', { nullable: true })
  outcomeNotes: string;
}