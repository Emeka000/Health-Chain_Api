import { User } from "src/entities/user.entity";
import { Department } from "src/medical-staff/entities/department.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('patients')
export class Patient {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @ManyToOne(() => Department)
  department: Department;

  @ManyToOne(() => User) // Assigned doctor
  primaryDoctor: User;
}
