import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  OneToMany,
  JoinTable,
} from 'typeorm';
import { DoctorStatus } from '../enums/doctor-status.enum';
import { Department } from './department.entity';
import { Specialty } from './specialty.entity';
import { MedicalLicense } from './medical-license.entity';
import { Schedule } from './schedule.entity';
import { PerformanceMetric } from './performance-metric.entity';
import { ContinuingEducation } from './continuing-education.entity';

@Entity('doctors')
export class Doctor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ type: 'date' })
  hireDate: Date;

  @Column({ type: 'enum', enum: DoctorStatus, default: DoctorStatus.ACTIVE })
  status: DoctorStatus;

  @Column()
  departmentId: string;

  @ManyToOne(() => Department, (department) => department.doctors)
  department: Department;

  @ManyToMany(() => Specialty, (specialty) => specialty.doctors)
  @JoinTable({
    name: 'doctor_specialties',
    joinColumn: { name: 'doctorId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'specialtyId', referencedColumnName: 'id' },
  })
  specialties: Specialty[];

  @OneToMany(() => MedicalLicense, (license) => license.doctor, {
    cascade: true,
  })
  licenses: MedicalLicense[];

  @OneToMany(() => Schedule, (schedule) => schedule.doctor)
  schedules: Schedule[];

  @OneToMany(() => PerformanceMetric, (metric) => metric.doctor)
  performanceMetrics: PerformanceMetric[];

  @OneToMany(() => ContinuingEducation, (education) => education.doctor)
  continuingEducation: ContinuingEducation[];

  @Column({ type: 'jsonb', nullable: true })
  credentials: {
    medicalSchool: string;
    graduationYear: number;
    residency: string;
    fellowship?: string;
    boardCertifications: string[];
  };

  @Column({ type: 'jsonb', nullable: true })
  contactInfo: {
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
