@Entity('hand_hygiene_compliance')
export class HandHygieneCompliance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  staffId: string;

  @Column()
  department: string;

  @Column({ type: 'date' })
  observationDate: Date;

  @Column({ type: 'int' })
  opportunitiesObserved: number;

  @Column({ type: 'int' })
  opportunitiesComplied: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  complianceRate: number;

  @Column()
  observedBy: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
