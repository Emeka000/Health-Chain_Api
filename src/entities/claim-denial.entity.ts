import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Claim } from './claim.entity';

export enum DenialReason {
  INVALID_DIAGNOSIS = 'invalid_diagnosis',
  INVALID_PROCEDURE = 'invalid_procedure',
  PRIOR_AUTHORIZATION_REQUIRED = 'prior_authorization_required',
  DUPLICATE_CLAIM = 'duplicate_claim',
  PATIENT_NOT_COVERED = 'patient_not_covered',
  SERVICE_NOT_COVERED = 'service_not_covered',
  INCOMPLETE_INFORMATION = 'incomplete_information',
  TIMELY_FILING_LIMIT = 'timely_filing_limit'
}

export enum AppealStatus {
  NOT_APPEALED = 'not_appealed',
  APPEAL_SUBMITTED = 'appeal_submitted',
  APPEAL_APPROVED = 'appeal_approved',
  APPEAL_DENIED = 'appeal_denied'
}

@Entity('claim_denials')
export class ClaimDenial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Claim, claim => claim.denials)
  claim: Claim;

  @Column()
  claimId: string;

  @Column({ type: 'enum', enum: DenialReason })
  denialReason: DenialReason;

  @Column()
  denialCode: string;

  @Column({ type: 'text' })
  denialDescription: string;

  @Column()
  denialDate: Date;

  @Column({ type: 'enum', enum: AppealStatus, default: AppealStatus.NOT_APPEALED })
  appealStatus: AppealStatus;

  @Column({ nullable: true })
  appealDate: Date;

  @Column({ type: 'text', nullable: true })
  appealNotes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
