// src/laboratory/entities/lab-equipment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { LabTest } from './lab-test.entity';

@Entity()
export class LabEquipment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  model: string;

  @Column()
  status: 'active' | 'inactive' | 'maintenance';

  @Column({ nullable: true })
  lastServicedDate: Date;

  @OneToMany(() => LabTest, (test) => test.equipment)
  tests: LabTest[];
}
