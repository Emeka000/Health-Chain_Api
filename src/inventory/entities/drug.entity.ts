import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Vendor } from '../../vendor/entities/vendor.entity';

@Entity()
export class Drug {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  lotNumber: string;

  @Column({ type: 'date' })
  expirationDate: Date;

  @Column()
  quantity: number;

  @Column()
  reorderPoint: number;

  @Column('decimal')
  cost: number;

  @ManyToOne(() => Vendor, (vendor) => vendor.drugs)
  vendor: Vendor;
}
