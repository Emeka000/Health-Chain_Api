import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string; // Doctor, Nurse, etc.

  @ManyToMany(() => Permission, { cascade: true })
  @JoinTable()
  permissions: Permission[];
}
