import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { ClaimStatus } from '../enums/claim-status.enum';
import { Invoice } from './invoice.entity';

@Entity('insurance_claims')
export class InsuranceClaim {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoiceId: string;

  @ManyToOne(() => Invoice)
  invoice: Invoice;

  @Column()
  patientId: string;

  @Column()
  insuranceProviderId: string;

  @Column()
  policyNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  claimAmount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  approvedAmount: number;

  @Column({ type: 'enum', enum: ClaimStatus, default: ClaimStatus.SUBMITTED })
  status: ClaimStatus;

  @Column({ type: 'jsonb' })
  diagnosisCodes: string[];

  @Column({ type: 'jsonb' })
  procedureCodes: string[];

  @Column({ type: 'date' })
  serviceDate: Date;

  @Column({ type: 'date', nullable: true })
  submissionDate: Date;

  @Column({ type: 'date', nullable: true })
  processedDate: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'jsonb', nullable: true })
  supportingDocuments: Array<{
    documentType: string;
    documentUrl: string;
    uploadDate: Date;
  }>;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
