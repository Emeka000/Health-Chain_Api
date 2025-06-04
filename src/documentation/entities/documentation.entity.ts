import { Entity, PrimaryGeneratedColumn, Column, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Appointment } from '../../appointments/entities/appointment.entity';

@Entity()
export class Documentation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Appointment, appointment => appointment.documentation)
  appointment: Appointment;

  @Column({ type: 'text' })
  chiefComplaint: string;

  @Column({ type: 'text' })
  historyOfPresentIllness: string;

  @Column({ type: 'text', nullable: true })
  pastMedicalHistory: string;

  @Column({ type: 'text', nullable: true })
  medications: string;

  @Column({ type: 'text', nullable: true })
  allergies: string;

  @Column({ type: 'text', nullable: true })
  socialHistory: string;

  @Column({ type: 'text', nullable: true })
  physicalExamination: string;

  @Column({ type: 'text', nullable: true })
  assessment: string;

  @Column({ type: 'text', nullable: true })
  plan: string;

  @Column({ type: 'json', nullable: true })
  vitalSigns: any;

  @Column({ type: 'json', nullable: true })
  attachments: string[];

  @Column({ default: false })
  isSigned: boolean;

  @Column({ type: 'datetime', nullable: true })
  signedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}