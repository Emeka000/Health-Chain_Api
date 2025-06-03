import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { LabOrder } from './lab-order.entity';

export enum ReportStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  DELIVERED = 'delivered'
}

export enum ReportFormat {
  PDF = 'pdf',
  HTML = 'html',
  XML = 'xml',
  HL7 = 'hl7'
}

@Entity('lab_reports')
export class LabReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LabOrder)
  labOrder: LabOrder;

  @Column()
  labOrderId: string;

  @Column()
  reportNumber: string;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.DRAFT })
  status: ReportStatus;

  @Column({ type: 'enum', enum: ReportFormat, default: ReportFormat.PDF })
  format: ReportFormat;

  @Column({ type: 'text' })
  content: string;

  @Column({ nullable: true })
  generatedBy: string;

  @Column({ nullable: true })
  reviewedBy: string;

  @Column({ nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  generatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @Column({ type: 'json', nullable: true })
  deliveryMethod: {
    type: string;
    recipient: string;
    status: string;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
