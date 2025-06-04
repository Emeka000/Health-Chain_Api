import { Entity, Column, TableInheritance, ChildEntity } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';
import { InheritanceStrategy, InheritanceType, DiscriminatorColumn } from '../../decorators/inheritance.decorator';

@Entity('persons')
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
@InheritanceStrategy(InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn('type')
export class Person extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;
}

@ChildEntity('EMPLOYEE')
export class Employee extends Person {
  @Column({ type: 'varchar', length: 50 })
  employeeId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salary: number;

  @Column({ type: 'varchar', length: 100 })
  department: string;

  @Column({ type: 'date', nullable: true })
  hireDate?: Date;
}

@ChildEntity('CUSTOMER')
export class Customer extends Person {
  @Column({ type: 'varchar', length: 50 })
  customerId: string;

  @Column({ type: 'varchar', length: 20, default: 'REGULAR' })
  customerType: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  creditLimit: number;

  @Column({ type: 'date', nullable: true })
  registrationDate?: Date;
}
