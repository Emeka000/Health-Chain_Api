import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from "typeorm"
import { EducationType } from "../enums/education-type.enum"
import { Doctor } from "./doctor.entity"

@Entity("continuing_education")
export class ContinuingEducation {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  doctorId: string

  @ManyToOne(
    () => Doctor,
    (doctor) => doctor.continuingEducation,
  )
  doctor: Doctor

  @Column({ type: "enum", enum: EducationType })
  educationType: EducationType

  @Column()
  title: string

  @Column()
  provider: string // Institution or organization providing the education

  @Column({ type: "decimal", precision: 5, scale: 2 })
  credits: number // CME credits earned

  @Column({ type: "date" })
  completionDate: Date

  @Column({ type: "date", nullable: true })
  expiryDate: Date // Some certifications expire

  @Column({ nullable: true })
  certificateNumber: string

  @Column({ nullable: true })
  accreditationBody: string // e.g., 'ACCME', 'AMA'

  @Column({ type: "jsonb", nullable: true })
  details: {
    duration: number // hours
    format: "ONLINE" | "IN_PERSON" | "HYBRID"
    category: string // e.g., 'Patient Safety', 'Medical Knowledge'
    documentUrl?: string
  }

  @Column({ type: "boolean", default: true })
  isVerified: boolean

  @Column({ type: "text", nullable: true })
  notes: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
