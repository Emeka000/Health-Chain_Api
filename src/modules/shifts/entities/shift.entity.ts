import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm"
import { ShiftType, ShiftStatus } from "../../../common/enums"
import { Nurse } from "../../nurses/entities/nurse.entity"
import { Department } from "../../departments/entities/department.entity"
import { ShiftHandoff } from "./shift-handoff.entity"

@Entity("shifts")
export class Shift {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column()
  nurseId: string

  @Column()
  departmentId: string

  @Column({ type: "timestamp" })
  startTime: Date

  @Column({ type: "timestamp" })
  endTime: Date

  @Column({
    type: "enum",
    enum: ShiftType,
  })
  shiftType: ShiftType

  @Column({
    type: "enum",
    enum: ShiftStatus,
    default: ShiftStatus.SCHEDULED,
  })
  status: ShiftStatus

  @Column({ type: "text", nullable: true })
  notes: string

  @Column({ type: "json", nullable: true })
  breakTimes: {
    startTime: string
    endTime: string
    type: "meal" | "rest"
  }[]

  @Column({ type: "decimal", precision: 4, scale: 2, nullable: true })
  actualHoursWorked: number

  @Column({ type: "timestamp", nullable: true })
  clockInTime: Date

  @Column({ type: "timestamp", nullable: true })
  clockOutTime: Date

  @Column({ default: false })
  isOvertime: boolean

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  overtimeHours: number

  @ManyToOne(
    () => Nurse,
    (nurse) => nurse.shifts,
  )
  @JoinColumn({ name: "nurseId" })
  nurse: Nurse

  @ManyToOne(
    () => Department,
    (department) => department.shifts,
  )
  @JoinColumn({ name: "departmentId" })
  department: Department

  @OneToMany(
    () => ShiftHandoff,
    (handoff) => handoff.fromShift,
  )
  handoffsGiven: ShiftHandoff[]

  @OneToMany(
    () => ShiftHandoff,
    (handoff) => handoff.toShift,
  )
  handoffsReceived: ShiftHandoff[]

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  get scheduledHours(): number {
    return (this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60 * 60)
  }

  get isActive(): boolean {
    const now = new Date()
    return this.status === ShiftStatus.IN_PROGRESS && now >= this.startTime && now <= this.endTime
  }
}
