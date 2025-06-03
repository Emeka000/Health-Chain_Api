import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Specimen {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  specimenType: string;

  @Column()
  status: string; // collected, in-transit, received, analyzed

  @CreateDateColumn()
  createdAt: Date;
}
