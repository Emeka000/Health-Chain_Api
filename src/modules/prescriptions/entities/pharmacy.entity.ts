import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Prescription } from './prescription.entity';

@Entity('pharmacies')
export class Pharmacy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  ncpdpId: string; // National Council for Prescription Drug Programs ID

  @Column({ nullable: true })
  npi: string; // National Provider Identifier

  @Column({ nullable: true })
  dea: string; // Drug Enforcement Administration number

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  faxNumber: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'json', nullable: true })
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  hoursOfOperation: string;

  @Column({ default: false })
  is24Hours: boolean;

  @Column({ default: false })
  isIntegrated: boolean;

  @Column({ nullable: true })
  integrationDetails: string;

  @Column({ nullable: true })
  apiEndpoint: string;

  @Column({ nullable: true })
  apiKey: string;

  @OneToMany(() => Prescription, (prescription) => prescription.pharmacy)
  prescriptions: Prescription[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
