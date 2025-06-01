import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class LabTest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  testCode: string;

  @Column()
  name: string;

  @Column('json')
  parameters: Record<string, any>; // e.g., { "glucose": { "min": 70, "max": 100 } }
}
