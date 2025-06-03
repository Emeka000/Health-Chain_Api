import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Patient } from '../../patients/entities/patient.entity';
import { LabResult } from './lab-result.entity';
import { LabWorkflow } from './lab-workflow.entity';

@Entity('lab_tests')
export class LabTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  testCode: string;

  @Column()
  testName: string;

  @Column()
  category: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ default: 60 })
  estimatedTimeMinutes: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'json', nullable: true })
  referenceRanges: {
    ageGroup: string;
    gender: string;
    minValue: number;
    maxValue: number;
    unit: string;
    normalRange: string;
  }[];

  @Column({ type: 'json', nullable: true })
  preparationInstructions: string[];

  @OneToMany(() => LabResult, (result: LabResult) => result.labTest)
  results: LabResult[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}