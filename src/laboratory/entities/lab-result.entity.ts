import { Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { LabOrder } from './lab-order.entity';

@Entity()
export class LabResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderId: string;

  @Column()
  testId: number;

  @Column()
  result: string;

  @Column()
  unit: string;

  @Column()
  referenceRange: string;
}
