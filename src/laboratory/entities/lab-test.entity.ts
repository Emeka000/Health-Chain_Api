import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class LabTest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  testName: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column({ nullable: true })
  specimenType: string;
}
