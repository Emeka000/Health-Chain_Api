import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Waste {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  drugId: number;

  @Column()
  reason: string;

  @Column()
  quantity: number;

  @Column({ type: 'date' })
  disposedOn: Date;
}
