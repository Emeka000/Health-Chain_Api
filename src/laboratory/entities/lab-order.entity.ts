import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class LabOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column('int', { array: true })
  testIds: number[];

  @CreateDateColumn()
  orderedAt: Date;

  @Column({ default: 'pending' })
  status: string; // pending, in-progress, completed
}
