import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Shift } from './shift.entity';
import { Nurse } from '../../nurses/entities/nurse.entity';

@Entity('shift_handoffs')
export class ShiftHandoff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fromShiftId: string;

  @Column()
  toShiftId: string;

  @Column()
  fromNurseId: string;

  @Column()
  toNurseId: string;

  @Column({ type: 'text' })
  handoffNotes: string;

  @Column({ type: 'json' })
  patientUpdates: {
    patientId: string;
    condition: string;
    medications: string[];
    specialInstructions: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
  }[];

  @Column({ type: 'json', nullable: true })
  departmentStatus: {
    censusCount: number;
    criticalPatients: number;
    pendingDischarges: number;
    pendingAdmissions: number;
    equipmentIssues?: string[];
    staffingConcerns?: string[];
  };

  @Column({ type: 'timestamp' })
  handoffTime: Date;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  receivingNurseComments: string;

  @Column({ type: 'json', nullable: true })
  followUpItems: {
    item: string;
    priority: 'low' | 'medium' | 'high';
    dueTime?: string;
  }[];

  @ManyToOne(() => Shift, (shift) => shift.handoffsGiven)
  @JoinColumn({ name: 'fromShiftId' })
  fromShift: Shift;

  @ManyToOne(() => Shift, (shift) => shift.handoffsReceived)
  @JoinColumn({ name: 'toShiftId' })
  toShift: Shift;

  @ManyToOne(() => Nurse)
  @JoinColumn({ name: 'fromNurseId' })
  fromNurse: Nurse;

  @ManyToOne(() => Nurse)
  @JoinColumn({ name: 'toNurseId' })
  toNurse: Nurse;

  @CreateDateColumn()
  createdAt: Date;
}
