import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm"
import { AssignmentType, AssignmentStatus, Priority } from "../../../common/enums"
import { Nurse } from "../../nurses/entities/nurse.entity"
import { Patient } from "../../patients/entities/patient.entity"
import { Department } from "../../departments/entities/department.entity"

@Entity("assignments")
export class Assignment {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  nurseId: string

  @Column({ nullable: true })
  patientId: string

  @Column({ nullable: true })
  departmentId: string

  @Column({
    type: "enum",
    enum: AssignmentType,
  })
  assignmentType: AssignmentType

  @Column({
    type: "enum",
    enum: AssignmentStatus,
    default: AssignmentStatus.ACTIVE,
  })
  status: AssignmentStatus

  @Column({
    type: "enum",
    enum: Priority,
    default: Priority.MEDIUM,
  })
  priority: Priority

  @Column({ type: "timestamp" })
  startTime: Date

  @Column({ type: "timestamp", nullable: true })
  endTime: Date

  @Column({ type: "text", nullable: true })
  assignmentNotes: string

  @Column({ type: "json", nullable: true })
  careRequirements: {
    medicationAdministration: boolean
    vitalSignsMonitoring: boolean
    mobilityAssistance: boolean
    woundCare: boolean
    ivTherapy: boolean
    specialDiet: boolean
    isolationPrecautions: boolean
    fallRisk: boolean
    other?: string[]
  }

  @Column({ type: "decimal", precision: 3, scale: 2, default: 1.0 })
  workloadWeight: number

  @ManyToOne(
    () => Nurse,
    (nurse) => nurse.assignments,
  )
  @JoinColumn({ name: "nurseId" })
  nurse: Nurse

  @ManyToOne(
    () => Patient,
    (patient) => patient.assignments,
    { nullable: true },
  )
  @JoinColumn({ name: "patientId" })
  patient: Patient

  @ManyToOne(
    () => Department,
    (department) => department.assignments,
    { nullable: true },
  )
  @JoinColumn({ name: "departmentId" })
  department: Department

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  get isActive(): boolean {
    return this.status === AssignmentStatus.ACTIVE
  }

  get duration(): number | null {
    if (!this.endTime) return null
    return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60 * 60)
  }
}
