import { User } from "src/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Patient } from "./patient.entity";

@Entity('emergency_overrides')
export class EmergencyOverride {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Patient)
  patient: Patient;

  @Column()
  reason: string;

  @Column()
  timestamp: Date;
}
