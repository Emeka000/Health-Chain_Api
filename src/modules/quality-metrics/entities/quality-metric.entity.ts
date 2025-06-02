import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm"
import { QualityMetricType } from "../../../common/enums"
import { Nurse } from "../../nurses/entities/nurse.entity"
import { Patient } from "../../patients/entities/patient.entity"
import { Department } from "../../departments/entities/department.entity"

@Entity("quality_metrics")
export class QualityMetric {
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
    enum: QualityMetricType,
  })
  metricType: QualityMetricType

  @Column({ type: "decimal", precision: 5, scale: 2 })
  value: number

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  targetValue: number

  @Column()
  unit: string

  @Column({ type: "date" })
  measurementDate: Date

  @Column({ type: "json", nullable: true })
  additionalData: {
    responseTime?: number
    satisfactionScore?: number
    complianceRate?: number
    errorCount?: number
    incidentDetails?: string
    improvementActions?: string[]
  }

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ default: false })
  isAchieved: boolean

  @ManyToOne(
    () => Nurse,
    (nurse) => nurse.qualityMetrics,
  )
  @JoinColumn({ name: "nurseId" })
  nurse: Nurse

  @ManyToOne(() => Patient, { nullable: true })
  @JoinColumn({ name: "patientId" })
  patient: Patient

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: "departmentId" })
  department: Department

  @CreateDateColumn()
  createdAt: Date

  get performancePercentage(): number {
    if (!this.targetValue) return 0
    return (this.value / this.targetValue) * 100
  }

  get isAboveTarget(): boolean {
    if (!this.targetValue) return false
    return this.value >= this.targetValue
  }
}
