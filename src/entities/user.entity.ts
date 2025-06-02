import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../auth/enum/user-role.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.BASIC })
  role: UserRole;

  @Column({ default: false })
  isMfaEnabled: boolean;

  @Column({ nullable: true })
  @Exclude()
  mfaSecret: string;

  @Column({ default: 0 })
  loginAttempts: number;

  @Column({ nullable: true })
  lastLoginAttempt: Date;

  @Column({ nullable: true })
  lockoutUntil: Date;

  @Column({ default: false })
  isLocked: boolean;

  @Column({ nullable: true })
  lastPasswordChange: Date;

  @Column({ default: true })
  requiresPasswordChange: boolean;

  @Column({ nullable: true })
  passwordHistory: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ type: 'jsonb', nullable: true })
  securityQuestions: { question: string; answer: string }[];
}
