import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { Doctor } from './doctor.entity';

@Entity('specialties')
export class Specialty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  code: string; // e.g., 'CARDIO', 'NEURO', 'ORTHO'

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToMany(() => Doctor, (doctor) => doctor.specialties)
  doctors: Doctor[];

  @Column({ type: 'jsonb', nullable: true })
  requirements: {
    boardCertification: string;
    minimumExperience: number; // years
    requiredTraining: string[];
    continuingEducationCredits: number; // per year
  };

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
