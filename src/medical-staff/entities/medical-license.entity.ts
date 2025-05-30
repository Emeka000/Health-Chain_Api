import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm"
import { Doctor } from "./doctor.entity"
import { LicenseStatus } from "../enums/license-status.enum"

@Entity("medical_licenses")
export class MedicalLicense {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  doctorId: string

  @ManyToOne(
    () => Doctor,
    (doctor) => doctor.licenses,
  )
  doctor: Doctor

  @Column()
  licenseType: string // e.g., 'Medical License', 'DEA License', 'Board Certification'

  @Column({ unique: true })
  licenseNumber: string

  @Column()
  issuingAuthority: string // e.g., 'State Medical Board', 'DEA', 'ABIM'

  @Column()
  issuingState: string

  @Column({ type: "date" })
  issueDate: Date

  @Column({ type: "date" })
  expiryDate: Date

  @Column({ type: "date", nullable: true })
  renewalDate: Date

  @Column({ type: "enum", enum: LicenseStatus, default: LicenseStatus.ACTIVE })
  status: LicenseStatus

  @Column({ type: "jsonb", nullable: true })
  restrictions: string[]

  @Column({ type: "jsonb", nullable: true })
  verificationDetails: {
    verifiedBy: string
    verificationDate: Date
    verificationMethod: string
    documentUrl?: string
  }

  @Column({ type: "text", nullable: true })
  notes: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
