import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { LabTest } from './lab-test.entity';

@Entity()
export class Specimen {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  barcode: string;

  @Column()
  type: string; // blood, urine, etc.

  @Column()
  status: string; // collected, in-transit, received

  @ManyToOne(() => LabTest)
  labTest: LabTest;
}
