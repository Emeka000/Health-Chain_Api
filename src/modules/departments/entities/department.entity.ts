import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SpecialtyType } from '../../../common/enums';
import { Shift } from '../../shifts/entities/shift.entity';
import { Assignment } from '../../assignments/entities/assignment.entity';

@Entity('departments')
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: SpecialtyType,
  })
  specialty: SpecialtyType;

  @Column()
  capacity: number;

  @Column()
  currentCensus: number;

  @Column({ type: 'json' })
  staffingRequirements: {
    dayShift: {
      registeredNurses: number;
      licensedPracticalNurses: number;
      certifiedNursingAssistants: number;
      supportStaff: number;
    };
    eveningShift: {
      registeredNurses: number;
      licensedPracticalNurses: number;
      certifiedNursingAssistants: number;
      supportStaff: number;
    };
    nightShift: {
      registeredNurses: number;
      licensedPracticalNurses: number;
      certifiedNursingAssistants: number;
      supportStaff: number;
    };
  };

  @Column()
  managerName: string;

  @Column()
  managerEmail: string;

  @Column()
  location: string;

  @Column({ type: 'json', nullable: true })
  equipment: {
    name: string;
    quantity: number;
    status: 'available' | 'in_use' | 'maintenance' | 'out_of_order';
  }[];

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Shift, (shift) => shift.department)
  shifts: Shift[];

  @OneToMany(() => Assignment, (assignment) => assignment.department)
  assignments: Assignment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  get occupancyRate(): number {
    return this.capacity > 0 ? (this.currentCensus / this.capacity) * 100 : 0;
  }

  get isAtCapacity(): boolean {
    return this.currentCensus >= this.capacity;
  }

  get availableBeds(): number {
    return Math.max(0, this.capacity - this.currentCensus);
  }
}
