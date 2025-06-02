import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LabResult } from './lab-result.entity';

export enum ResultFlag {
  NORMAL = 'normal',
  HIGH = 'high',
  LOW = 'low',
  CRITICAL_HIGH = 'critical_high',
  CRITICAL_LOW = 'critical_low',
  ABNORMAL = 'abnormal',
}

@Entity('test_results')
export class TestResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'parameter_id' })
  parameterId: string;

  @Column({ name: 'parameter_name' })
  parameterName: string;

  @Column({ type: 'text' })
  value: string;

  @Column({ nullable: true })
  unit: string;

  @Column({ name: 'reference_range', nullable: true })
  referenceRange: string;

  @Column({ type: 'enum', enum: ResultFlag, nullable: true })
  flag: ResultFlag;

  @Column({ type: 'text', nullable: true })
  comments: string;

  @Column({ name: 'lab_result_id' })
  labResultId: string;

  @ManyToOne(() => LabResult, (labResult) => labResult.results, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'lab_result_id' })
  labResult: LabResult;
}
