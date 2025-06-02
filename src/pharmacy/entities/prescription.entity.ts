import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Prescription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  patientId: string;

  @Column('jsonb')
  drugs: {
    drugId: string;
    dosage: string;
    frequency: string;
    duration: string;
  }[];

  @CreateDateColumn()
  createdAt: Date;
}
