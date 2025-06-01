import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class QualityControl {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  testCode: string;

  @Column()
  controlType: string; // e.g., positive, negative, standard

  @Column('json')
  controlResults: Record<string, number>;

  @Column()
  date: Date;

  @Column()
  passed: boolean;
}
