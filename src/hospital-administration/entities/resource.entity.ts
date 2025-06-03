import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Department } from './department.entity';
import { ResourceAllocation } from './resource-allocation.entity';

export enum ResourceType {
  EQUIPMENT = 'equipment',
  MEDICINE = 'medicine',
  SUPPLY = 'supply',
  VEHICLE = 'vehicle',
}

export enum ResourceStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
  OUT_OF_ORDER = 'out_of_order',
}

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ResourceType })
  type: ResourceType;

  @Column({ nullable: true })
  model: string;

  @Column({ nullable: true })
  manufacturer: string;

  @Column({ name: 'serial_number', nullable: true })
  serialNumber: string;

  @Column({ name: 'purchase_date', nullable: true })
  purchaseDate: Date;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'purchase_cost',
    nullable: true,
  })
  purchaseCost: number;

  @Column({ name: 'current_quantity' })
  currentQuantity: number;

  @Column({ name: 'minimum_quantity' })
  minimumQuantity: number;

  @Column({ name: 'maximum_quantity' })
  maximumQuantity: number;

  @Column()
  unit: string;

  @Column({
    type: 'enum',
    enum: ResourceStatus,
    default: ResourceStatus.AVAILABLE,
  })
  status: ResourceStatus;

  @Column({ name: 'department_id' })
  departmentId: string;

  @ManyToOne(() => Department, (department) => department)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => ResourceAllocation, (allocation) => allocation.resource)
  allocations: ResourceAllocation[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
