@Entity('root_cause_analyses')
export class RootCauseAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  incidentId: string;

  @ManyToOne(() => IncidentReport, incident => incident.rootCauseAnalyses)
  @JoinColumn({ name: 'incidentId' })
  incident: IncidentReport;

  @Column('text')
  analysis: string;

  @Column('text')
  rootCause: string;

  @Column('text')
  contributingFactors: string;

  @Column()
  analyzedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
