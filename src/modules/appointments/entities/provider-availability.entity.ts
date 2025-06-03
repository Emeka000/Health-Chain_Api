import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../entities/user.entity';

@Entity('provider_availability')
export class ProviderAvailability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'provider_id' })
  provider: User;

  @Column({ name: 'provider_id' })
  providerId: string;

  @Column({ type: 'timestamp' })
  startDateTime: Date;

  @Column({ type: 'timestamp' })
  endDateTime: Date;

  @Column({ default: true })
  isAvailable: boolean;

  @Column({ default: true })
  isRecurring: boolean;

  @Column({ nullable: true })
  recurrencePattern: string; // e.g., 'WEEKLY', 'DAILY', etc.

  @Column({ nullable: true })
  recurrenceEndDate: Date;

  @Column({ default: false })
  isTelemedicineAvailable: boolean;

  @Column({ default: true })
  isInPersonAvailable: boolean;

  @Column({ type: 'json', nullable: true })
  specialtiesAvailable: string[];

  @Column({ nullable: true })
  location: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  /**
   * Calculate the duration of the availability in minutes
   */
  get durationMinutes(): number {
    return Math.round(
      (this.endDateTime.getTime() - this.startDateTime.getTime()) / (1000 * 60),
    );
  }

  /**
   * Check if the availability overlaps with a given time range
   */
  overlapsWithTimeRange(startTime: Date, endTime: Date): boolean {
    return (
      (this.startDateTime <= startTime && this.endDateTime > startTime) ||
      (this.startDateTime < endTime && this.endDateTime >= endTime) ||
      (startTime <= this.startDateTime && endTime >= this.endDateTime)
    );
  }
}
