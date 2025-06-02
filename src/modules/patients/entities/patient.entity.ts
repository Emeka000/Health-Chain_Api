import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { PatientStatus, Priority } from "../../../common/enums"
import { Assignment } from "../../assignments/entities/assignment.entity"
import { Documentation } from "../../documentation/entities/documentation.entity"

@Entity("patients")
export class Patient {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  medicalRecordNumber: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column({ type: "date" })
  dateOfBirth: Date

  @Column()
  gender: string

  @Column({ nullable: true })
  phoneNumber: string

  @Column({ type: "json", nullable: true })
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }

  @Column({ type: "json", nullable: true })
  emergencyContact: {
    name: string
    relationship: string
    phoneNumber: string
  }

  @Column({ type: "timestamp" })
  admissionDate: Date

  @Column({ type: "timestamp", nullable: true })
  dischargeDate: Date

  @Column({
    type: "enum",
    enum: PatientStatus,
    default: PatientStatus.ADMITTED,
  })
  status: PatientStatus

  @Column({
    type: "enum",
    enum: Priority,
    default: Priority.MEDIUM,
  })
  acuityLevel: Priority

  @Column({ type: "text", nullable: true })
  primaryDiagnosis: string

  @Column("simple-array", { nullable: true })
  secondaryDiagnoses: string[]

  @Column("simple-array", { nullable: true })
  allergies: string[]

  @Column({ type: "json", nullable: true })
  currentMedications: {
    name: string
    dosage: string
    frequency: string
    route: string
    prescribedBy: string
  }[]

  @Column()
  roomNumber: string

  @Column()
  bedNumber: string

  @Column({ nullable: true })
  attendingPhysician: string

  @Column({ nullable: true })
  primaryNurse: string

  @OneToMany(
    () => Assignment,
    (assignment) => assignment.patient,
  )
  assignments: Assignment[]

  @OneToMany(
    () => Documentation,
    (documentation) => documentation.patient,
  )
  documentation: Documentation[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`
  }

  get age(): number {
    const today = new Date()
    const birthDate = new Date(this.dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }

    return age
  }

  get lengthOfStay(): number {
    const endDate = this.dischargeDate || new Date()
    return Math.ceil((endDate.getTime() - this.admissionDate.getTime()) / (1000 * 60 * 60 * 24))
  }
}
