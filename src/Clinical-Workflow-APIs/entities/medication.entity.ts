import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Prescription } from './prescription.entity';

@Entity('medications')
export class Medication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  genericName: string;

  @Column()
  brandName: string;

  @Column()
  drugClass: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json' })
  contraindications: object;

  @Column({ type: 'json' })
  sideEffects: object;

  @Column({ type: 'json' })
  interactions: object;

  @Column()
  strength: string;

  @Column()
  form: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Prescription, prescription => prescription.medication)
  prescriptions: Prescription[];
}
