@Entity('mitigation_strategies')
export class MitigationStrategy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  riskAssessmentId: string;

  @ManyToOne(() => RiskAssessment, ra => ra.mitigationStrategies)
  @JoinColumn({ name: 'riskAssessmentId' })
  riskAssessment: RiskAssessment;

  @Column()
  strategy: string;

  @Column('text')
  description: string;

  @Column()
  responsiblePerson: string;

  @Column({ type: 'date' })
  implementationDate: Date;

  @Column('text', { nullable: true })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
