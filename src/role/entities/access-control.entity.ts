import { User } from "src/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('access_logs')
export class AccessLog {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  resource: string;

  @Column()
  action: string;

  @Column()
  timestamp: Date;

  @Column({ nullable: true })
  reason: string;
}
