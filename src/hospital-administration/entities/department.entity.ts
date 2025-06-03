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
import { Staff } from './staff.entity';
import { Bed } from './bed.entity';
import { Ward } from './ward.entity';
import { Equipment } from './equipment.entity';
import { Workflow } from './workflow.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  code: string;

  @Column({ name: 'floor_number', nullable: true })
  floorNumber: number;

  @Column({ name: 'bed_capacity' })
  bedCapacity: number;

  @Column({ type: 'enum', enum: ['active', 'inactive'], default: 'active' })
  status: string;

  @Column({ name: 'hospital_id' })
  hospitalId: string;

  @ManyToOne(() => Hospital, (hospital) => hospital.departments)
  @JoinColumn({ name: 'hospital_id' })
  hospital: Hospital;

  @OneToMany(() => Staff, (staff) => staff.department)
  staff: Staff[];

  @OneToMany(() => Bed, (bed) => bed.department)
  beds: Bed[];

  @OneToMany(() => Ward, (ward) => ward.department)
  wards: Ward[];

  @OneToMany(() => Equipment, (equipment) => equipment.department)
  equipment: Equipment[];

  @OneToMany(() => Workflow, (workflow) => workflow.department)
  workflows: Workflow[];

  @Column({ default: 0 })
  performanceScore: number;

  @Column('text', { array: true })
  specialties: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
