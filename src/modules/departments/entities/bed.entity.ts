import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Room } from './room.entity';

export enum BedStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
}

@Entity('beds')
export class Bed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  number: string;

  @ManyToOne(() => Room, (room) => room.beds, { onDelete: 'CASCADE' })
  room: Room;

  @Column({ type: 'enum', enum: BedStatus, default: BedStatus.AVAILABLE })
  status: BedStatus;

  @Column({ nullable: true })
  assignedPatientId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
