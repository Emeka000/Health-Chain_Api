import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Hospital } from './hospital.entity';
import { Department } from './department.entity';

export enum StaffRole {
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  TECHNICIAN = 'technician',
  ADMINISTRATOR = 'administrator',
  SUPPORT = 'support',
  SECURITY = 'security',
  PHARMACIST = 'pharmacist',
  THERAPIST = 'therapist'
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  INTERN = 'intern'
}

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'employee_id', unique: true })
  employeeId: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  address: string;

  @Column({ type: 'enum', enum: StaffRole })
  role: StaffRole;

  @Column()
  specialization: string;

  @Column({ name: 'license_number', nullable: true })
  licenseNumber: string;

  @Column({ type: 'enum', enum: EmploymentType })
  employmentType: EmploymentType;

  @Column({ name: 'hire_date' })
  hireDate: Date;

  @Column({ name: 'termination_date', nullable: true })
  terminationDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  salary: number;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'on_leave'], default: 'active' })
  status: string;

  @Column({ name: 'hospital_id' })
  hospitalId: string;

  @Column({ name: 'department_id' })
  departmentId: string;

  @ManyToOne(() => Hospital, hospital => hospital.staff)
  @JoinColumn({ name: 'hospital_id' })
  hospital: Hospital;

  @ManyToOne(() => Department, department => department.staff)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @Column('json', { nullable: true })
  qualifications: any[];

  @Column('json', { nullable: true })
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}