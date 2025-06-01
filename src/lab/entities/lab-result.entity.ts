import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { TestOrder } from './test-order.entity';

@Entity()
export class LabResult {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => TestOrder)
  testOrder: TestOrder;

  @Column('json')
  results: Record<string, number>; // e.g., { "glucose": 120 }

  @Column({ default: false })
  isValidated: boolean;

  @Column({ nullable: true })
  validatedBy: string;
}
