import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm"
import { Doctor } from "./doctor.entity"

@Entity("departments")
export class Department {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ unique: true })
  name: string

  @Column()
  code: string // e.g., 'CARD', 'NEUR', 'ORTH'

  @Column({ type: "text", nullable: true })
  description: string

  @Column({ nullable: true })
  headOfDepartmentId: string

  @OneToMany(
    () => Doctor,
    (doctor) => doctor.department,
  )
  doctors: Doctor[]

  @Column({ type: "jsonb", nullable: true })
  contactInfo: {
    phone: string
    email: string
    location: string
  }

  @Column({ type: "jsonb", nullable: true })
  operatingHours: {
    monday: { start: string; end: string }
    tuesday: { start: string; end: string }
    wednesday: { start: string; end: string }
    thursday: { start: string; end: string }
    friday: { start: string; end: string }
    saturday?: { start: string; end: string }
    sunday?: { start: string; end: string }
  }

  @Column({ type: "boolean", default: true })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
