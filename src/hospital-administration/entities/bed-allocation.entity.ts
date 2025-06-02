import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Bed } from './bed.entity';
import { Patient } from './patient.entity';
import { Staff } from './staff.entity';

@Entity('bed_allocations')
export class BedAllocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'allocation_date' })
  allocationDate: Date;

  @Column({ name: 'expected_discharge_date', nullable: true })
  expectedDischargeDate: Date;

  @Column({ name: 'actual_discharge_date', nullable: true })
  actualDischargeDate: Date;

  @Column('text', { nullable: true })
  notes: string;

  @Column({ name: 'bed_id' })
  bedId: string;

  @Column({ name: 'patient_id' })
  patientId: string;

  @Column({ name: 'assigned_by' })
  assignedBy: string;

  @ManyToOne(() => Bed, bed => bed.allocations)
  @JoinColumn({ name: 'bed_id' })
  bed: Bed;

  @ManyToOne(() => Patient, patient => patient.bedAllocations)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => Staff, staff => staff)
  @JoinColumn({ name: 'assigned_by' })
  assignedByStaff: Staff;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}