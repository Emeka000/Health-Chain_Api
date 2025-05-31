import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class DrugInteractionLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { array: true })
  drugsChecked: string[];

  @Column('jsonb')
  interactionResult: any;

  @CreateDateColumn()
  checkedAt: Date;
}
