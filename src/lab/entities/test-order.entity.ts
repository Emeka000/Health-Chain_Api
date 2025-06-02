import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Specimen } from './specimen.entity';
import { LabTest } from './lab-test.entity';

@Entity()
export class TestOrder {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => LabTest)
  labTest: LabTest;

  @Column()
  patientId: string;

  @Column()
  scheduledAt: Date;

  @OneToOne(() => Specimen)
  @JoinColumn()
  specimen: Specimen;

  @Column({ default: 'pending' })
  status: string; // pending, in-progress, completed
}
