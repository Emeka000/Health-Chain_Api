import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Ward } from './ward.entity';
import { Bed } from './bed.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: string;

  @ManyToOne(() => Ward, (ward) => ward.rooms, { onDelete: 'CASCADE' })
  ward: Ward;

  @OneToMany(() => Bed, (bed) => bed.room)
  beds: Bed[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
