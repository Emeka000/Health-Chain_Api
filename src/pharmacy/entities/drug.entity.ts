import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Drug {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  manufacturer: string;

  @Column()
  dosageForm: string;

  @Column()
  strength: string;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  notes?: string;
}
