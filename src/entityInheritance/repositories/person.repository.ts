import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person, Employee, Customer } from '../entities/single-table/person.entity';
import { BaseInheritanceRepository } from './base-inheritance.repository';
import { InheritanceType } from '../decorators/inheritance.decorator';

@Injectable()
export class PersonRepository extends BaseInheritanceRepository<Person> {
  constructor(
    @InjectRepository(Person)
    repository: Repository<Person>
  ) {
    super(repository, InheritanceType.SINGLE_TABLE);
  }

  async findEmployees(): Promise<Employee[]> {
    return this.findByType<Employee>('EMPLOYEE');
  }

  async findCustomers(): Promise<Customer[]> {
    return this.findByType<Customer>('CUSTOMER');
  }

  async findEmployeesByDepartment(department: string): Promise<Employee[]> {
    return this.findByType<Employee>('EMPLOYEE', { department } as any);
  }

  async findCustomersByType(customerType: string): Promise<Customer[]> {
    return this.findByType<Customer>('CUSTOMER', { customerType } as any);
  }

  async findHighValueCustomers(minCreditLimit: number): Promise<Customer[]> {
    return this.repository
      .createQueryBuilder('person')
      .where('person.type = :type', { type: 'CUSTOMER' })
      .andWhere('person.creditLimit >= :minLimit', { minLimit: minCreditLimit })
      .getMany() as Promise<Customer[]>;
  }

  async getEmployeeStatsByDepartment(): Promise<{ department: string; count: number; avgSalary: number }[]> {
    return this.repository
      .createQueryBuilder('person')
      .select('person.department', 'department')
      .addSelect('COUNT(*)', 'count')
      .addSelect('AVG(person.salary)', 'avgSalary')
      .where('person.type = :type', { type: 'EMPLOYEE' })
      .groupBy('person.department')
      .getRawMany();
  }
}
