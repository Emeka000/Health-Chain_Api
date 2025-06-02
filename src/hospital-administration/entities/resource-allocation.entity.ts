import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Resource } from './resource.entity';
import { Staff } from './staff.entity';
import { Department } from './department.entity';

@Entity('resource_allocations')
export class ResourceAllocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'allocation_date' })
  allocationDate: Date;

  @Column({ name: 'return_date', nullable: true })
  returnDate: Date;

  @Column()
  quantity: number;

  @Column('text', { nullable: true })
  purpose: string;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ name: 'resource_id' })
  resourceId: string;

  @Column({ name: 'allocated_to_staff_id', nullable: true })
  allocatedToStaffId: string;

  @Column({ name: 'allocated_to_department_id', nullable: true })
  allocatedToDepartmentId: string;

  @Column({ name: 'allocated_by' })
  allocatedBy: string;

  @ManyToOne(() => Resource, resource => resource.allocations)
  @JoinColumn({ name: 'resource_id' })
  resource: Resource;

  @ManyToOne(() => Staff, staff => staff)
  @JoinColumn({ name: 'allocated_to_staff_id' })
  allocatedToStaff: Staff;

  @ManyToOne(() => Department, department => department)
  @JoinColumn({ name: 'allocated_to_department_id' })
  allocatedToDepartment: Department;

  @ManyToOne(() => Staff, staff => staff)
  @JoinColumn({ name: 'allocated_by' })
  allocatedByStaff: Staff;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}