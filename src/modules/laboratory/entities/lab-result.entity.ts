import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { LabOrder } from './lab-order.entity';
import { LabTest } from './lab-test.entity';

export enum LabResultStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  VERIFIED = 'verified',
  REPORTED = 'reported'
}

@Entity('lab_results')
export class LabResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LabOrder, order => order.results)
  labOrder: LabOrder;

  @Column()
  labOrderId: string;

  @ManyToOne(() => LabTest, test => test.results)
  labTest: LabTest;

  @Column()
  labTestId: string;

  @Column({ type: 'varchar', nullable: true })
  value: string;

  @Column({ nullable: true })
  unit: string;

  @Column({ nullable: true })
  referenceRange: string;

  @Column({ type: 'enum', enum: LabResultStatus, default: LabResultStatus.PENDING })
  status: LabResultStatus;

  @Column({ type: 'boolean', default: false })
  isAbnormal: boolean;

  @Column({ type: 'text', nullable: true })
  interpretation: string;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ nullable: true })
  performedBy: string;

  @Column({ nullable: true })
  verifiedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  performedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt: Date;

  @Column({ type: 'json', nullable: true })
  qualityControlData: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
