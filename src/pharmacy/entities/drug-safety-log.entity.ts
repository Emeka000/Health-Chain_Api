import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class DrugSafetyLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  drug: string;

  @Column('text', { array: true })
  patientConditions: string[];

  @Column('jsonb')
  safetyResult: any;

  @CreateDateColumn()
  checkedAt: Date;
}
