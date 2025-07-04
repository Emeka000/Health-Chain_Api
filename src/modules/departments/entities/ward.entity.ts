import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Department } from './department.entity';
import { Room } from './room.entity';

@Entity('wards')
export class Ward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Department, (department) => department.id, { onDelete: 'CASCADE' })
  department: Department;

  @OneToMany(() => Room, (room) => room.ward)
  rooms: Room[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 