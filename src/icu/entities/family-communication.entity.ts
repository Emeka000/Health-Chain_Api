import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IcuPatient } from './icu-patient.entity';

@Entity()
export class FamilyCommunication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => IcuPatient, patient => patient.bed)
  patient: IcuPatient;

  @Column()
  familyMemberName: string;

  @Column()
  relationship: string;

  @Column()
  contactNumber: string;

  @Column()
  email: string;

  @Column()
  preferredLanguage: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastVisit: Date;

  @Column()
  visitingStatus: 'approved' | 'pending' | 'restricted';

  @Column({ type: 'json', nullable: true })
  visitingSchedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];

  @Column({ type: 'json', nullable: true })
  communicationPreferences: {
    method: 'phone' | 'email' | 'in-person';
    frequency: 'daily' | 'weekly' | 'as-needed';
    preferredTime: string;
  };

  @Column({ nullable: true })
  notes: string;
} 