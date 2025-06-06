import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('diagnoses')
export class Diagnosis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  icd10Code: string;

  @Column()
  title: string;

  @Column('text')
  notes: string;

  @Column()
  patientId: string;

  @CreateDateColumn()
  diagnosedAt: Date;
}
