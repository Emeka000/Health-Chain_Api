import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { BedAllocation } from './bed-allocation.entity';
import { Bill } from './bill.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

export enum PatientStatus {
  ADMITTED = 'admitted',
  DISCHARGED = 'discharged',
  OUTPATIENT = 'outpatient',
  EMERGENCY = 'emergency',
}

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'patient_id', unique: true })
  patientId: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'date_of_birth' })
  dateOfBirth: Date;

  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  address: string;

  @Column({ name: 'emergency_contact_name' })
  emergencyContactName: string;

  @Column({ name: 'emergency_contact_phone' })
  emergencyContactPhone: string;

  @Column({ name: 'insurance_number', nullable: true })
  insuranceNumber: string;

  @Column({ name: 'insurance_provider', nullable: true })
  insuranceProvider: string;

  @Column({
    type: 'enum',
    enum: PatientStatus,
    default: PatientStatus.OUTPATIENT,
  })
  status: PatientStatus;

  @Column('json', { nullable: true })
  medicalHistory: any;

  @Column('json', { nullable: true })
  allergies: string[];

  @OneToMany(() => BedAllocation, (allocation) => allocation.patient)
  bedAllocations: BedAllocation[];

  @OneToMany(() => Bill, (bill) => bill.patient)
  bills: Bill[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
