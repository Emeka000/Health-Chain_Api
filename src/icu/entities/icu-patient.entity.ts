import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from 'typeorm';
import { IcuBed } from './icu-bed.entity';
import { VitalSigns } from './vital-signs.entity';
import { Medication } from './medication.entity';
import { Intervention } from './intervention.entity';

@Entity()
export class IcuPatient {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column()
  gender: string;

  @Column()
  admissionDate: Date;

  @Column()
  diagnosis: string;

  @Column()
  severity: 'critical' | 'serious' | 'stable';

  @OneToOne(() => IcuBed, bed => bed.patient)
  bed: IcuBed;

  @OneToMany(() => VitalSigns, vitalSigns => vitalSigns.patient)
  vitalSigns: VitalSigns[];

  @OneToMany(() => Medication, medication => medication.patient)
  medications: Medication[];

  @OneToMany(() => Intervention, intervention => intervention.patient)
  interventions: Intervention[];

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastUpdated: Date;
} 