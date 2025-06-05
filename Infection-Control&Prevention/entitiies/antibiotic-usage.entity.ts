@Entity('antibiotic_usage')
export class AntibioticUsage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column()
  antibiotic: string;

  @Column()
  dosage: string;

  @Column()
  frequency: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column()
  indication: string;

  @Column()
  prescribedBy: string;

  @Column({ type: 'text', nullable: true })
  cultureResults: string;

  @Column({ type: 'text', nullable: true })
  resistancePattern: string;

  @Column({ default: false })
  requiresReview: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
