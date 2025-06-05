export enum RiskLevel {
    LOW = 'low',
    MEDIUM = 'medium',
    HIGH = 'high',
    VERY_HIGH = 'very_high'
  }
  
  @Entity('risk_assessments')
  export class RiskAssessment {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    title: string;
  
    @Column('text')
    description: string;
  
    @Column({ type: 'enum', enum: RiskLevel })
    riskLevel: RiskLevel;
  
    @Column('decimal', { precision: 3, scale: 2 })
    probability: number; // 0-1
  
    @Column('decimal', { precision: 10, scale: 2 })
    impact: number; // 1-10
  
    @Column({ nullable: true })
    departmentId: string;
  
    @Column()
    assessedBy: string;
  
    @Column({ type: 'date' })
    nextReviewDate: Date;
  
    @OneToMany(() => MitigationStrategy, ms => ms.riskAssessment)
    mitigationStrategies: MitigationStrategy[];
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }