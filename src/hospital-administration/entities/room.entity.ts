import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Bed } from './bed.entity';
import { Ward } from './ward.entity';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  roomNumber: string;

  @ManyToOne(() => Ward, (ward) => ward.rooms)
  ward: Ward;

  @OneToMany(() => Bed, (bed) => bed.room)
  beds: Bed[];
}
