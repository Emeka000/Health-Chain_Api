import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { IcuPatient } from './icu-patient.entity';

@Entity()
export class QualityMetrics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => IcuPatient, patient => patient.bed)
  patient: IcuPatient;

  @Column('decimal', { precision: 5, scale: 2 })
  lengthOfStay: number;

  @Column()
  mortalityRisk: 'low' | 'medium' | 'high';

  @Column()
  readmissionRate: number;

  @Column()
  ventilatorAssociatedPneumonia: boolean;

  @Column()
  centralLineAssociatedBloodstreamInfection: boolean;

  @Column()
  catheterAssociatedUrinaryTractInfection: boolean;

  @Column()
  pressureUlcers: boolean;

  @Column()
  falls: boolean;

  @Column({ type: 'json' })
  apacheScore: {
    age: number;
    temperature: number;
    meanArterialPressure: number;
    heartRate: number;
    respiratoryRate: number;
    oxygenation: number;
    arterialPh: number;
    sodium: number;
    potassium: number;
    creatinine: number;
    hematocrit: number;
    whiteBloodCellCount: number;
    glasgowComaScore: number;
  };

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  recordedAt: Date;
} 