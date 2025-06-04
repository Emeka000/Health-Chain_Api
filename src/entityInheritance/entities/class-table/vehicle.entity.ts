import { Entity, Column, PrimaryColumn, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';
import { InheritanceStrategy, InheritanceType } from '../../decorators/inheritance.decorator';

@Entity('vehicles')
@InheritanceStrategy(InheritanceType.CLASS_TABLE)
export class Vehicle extends BaseEntity {
  @Column({ type: 'varchar', length: 17, unique: true })
  vin: string;

  @Column({ type: 'varchar', length: 50 })
  make: string;

  @Column({ type: 'varchar', length: 50 })
  model: string;

  @Column({ type: 'int' })
  year: number;

  @Column({ type: 'varchar', length: 30 })
  color: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}

@Entity('cars')
export class Car extends Vehicle {
  @PrimaryColumn()
  @OneToOne(() => Vehicle, { primary: true })
  @JoinColumn()
  id: string;

  @Column({ type: 'int', default: 4 })
  numberOfDoors: number;

  @Column({ type: 'varchar', length: 20 })
  transmissionType: string;

  @Column({ type: 'varchar', length: 20 })
  fuelType: string;

  @Column({ type: 'decimal', precision: 4, scale: 1 })
  engineSize: number;
}

@Entity('motorcycles')
export class Motorcycle extends Vehicle {
  @PrimaryColumn()
  @OneToOne(() => Vehicle, { primary: true })
  @JoinColumn()
  id: string;

  @Column({ type: 'int' })
  engineCapacity: number;

  @Column({ type: 'varchar', length: 20 })
  motorcycleType: string;

  @Column({ type: 'boolean', default: false })
  hasSidecar: boolean;

  @Column({ type: 'decimal', precision: 4, scale: 1 })
  seatHeight: number;
}
