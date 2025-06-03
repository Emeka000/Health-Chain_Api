import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import {
  UserRole,
  type CertificationType,
  type SpecialtyType,
} from '../../../common/enums';
import { Shift } from '../../shifts/entities/shift.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';
import { Documentation } from '../../documentation/entities/documentation.entity';
import { QualityMetric } from '../../quality-metrics/entities/quality-metric.entity';

@Entity('nurses')
export class Nurse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  employeeId: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.REGISTERED_NURSE,
  })
  role: UserRole;

  @Column('simple-array')
  certifications: CertificationType[];

  @Column('simple-array')
  specialties: SpecialtyType[];

  @Column({ type: 'date' })
  hireDate: Date;

  @Column({ type: 'date', nullable: true })
  licenseExpiryDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 1.0 })
  workloadCapacity: number;

  @Column({ type: 'json', nullable: true })
  preferences: {
    preferredShifts?: string[];
    preferredDepartments?: string[];
    availabilityDays?: string[];
  };

  @Column({ type: 'json', nullable: true })
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };

  @OneToMany(() => Shift, (shift) => shift.nurse)
  shifts: Shift[];

  @OneToMany(() => Assignment, (assignment) => assignment.nurse)
  assignments: Assignment[];

  @OneToMany(() => Documentation, (documentation) => documentation.nurse)
  documentation: Documentation[];

  @OneToMany(() => QualityMetric, (metric) => metric.nurse)
  qualityMetrics: QualityMetric[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get isLicenseExpiringSoon(): boolean {
    if (!this.licenseExpiryDate) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return this.licenseExpiryDate <= thirtyDaysFromNow;
  }
}
