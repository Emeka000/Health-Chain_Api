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
import { Hospital } from './hospital.entity';
import { Department } from './department.entity';
import { BedAllocation } from './bed-allocation.entity';
import { Room } from './room.entity';

export enum BedType {
  GENERAL = 'general',
  ICU = 'icu',
  EMERGENCY = 'emergency',
  MATERNITY = 'maternity',
  PEDIATRIC = 'pediatric',
  SURGICAL = 'surgical',
}

export enum BedStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
  RESERVED = 'reserved',
}

@Entity('beds')
export class Bed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'bed_number', unique: true })
  bedNumber: string;

  @Column({ type: 'enum', enum: BedType })
  type: BedType;

  @Column({ name: 'room_number' })
  roomNumber: string;

  @Column({ name: 'floor_number' })
  floorNumber: number;

  @Column({ type: 'enum', enum: BedStatus, default: BedStatus.AVAILABLE })
  status: BedStatus;

  @Column({ type: 'decimal', precision: 8, scale: 2, name: 'daily_rate' })
  dailyRate: number;

  @Column('json', { nullable: true })
  equipment: string[];

  @Column('text', { nullable: true })
  notes: string;

  @Column({ name: 'hospital_id' })
  hospitalId: string;

  @ManyToOne(() => Room, (room) => room.beds)
  room: Room;

  @Column({ name: 'department_id' })
  departmentId: string;

  @ManyToOne(() => Hospital, (hospital) => hospital.beds)
  @JoinColumn({ name: 'hospital_id' })
  hospital: Hospital;

  @ManyToOne(() => Department, (department) => department.beds)
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @OneToMany(() => BedAllocation, (allocation) => allocation.bed)
  allocations: BedAllocation[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
