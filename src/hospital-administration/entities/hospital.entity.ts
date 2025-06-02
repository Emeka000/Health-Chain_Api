import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Department } from './department.entity';
import { Staff } from './staff.entity';
import { Bed } from './bed.entity';

@Entity('hospitals')
export class Hospital {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  address: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  website: string;

  @Column({ name: 'license_number', unique: true })
  licenseNumber: string;

  @Column({ name: 'total_beds' })
  totalBeds: number;

  @Column({ type: 'enum', enum: ['active', 'inactive', 'maintenance'], default: 'active' })
  status: string;

  @Column('json', { nullable: true })
  settings: Record<string, any>;

  @OneToMany(() => Department, department => department.hospital)
  departments: Department[];

  @OneToMany(() => Staff, staff => staff.hospital)
  staff: Staff[];

  @OneToMany(() => Bed, bed => bed.hospital)
  beds: Bed[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}