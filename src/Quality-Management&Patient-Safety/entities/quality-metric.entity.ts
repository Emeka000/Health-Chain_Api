export enum MetricType {
    INFECTION_RATE = 'infection_rate',
    READMISSION_RATE = 'readmission_rate',
    PATIENT_SATISFACTION = 'patient_satisfaction',
    INCIDENT_RATE = 'incident_rate',
    MORTALITY_RATE = 'mortality_rate'
  }
  
  @Entity('quality_metrics')
  export class QualityMetric {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'enum', enum: MetricType })
    type: MetricType;
  
    @Column()
    name: string;
  
    @Column('decimal', { precision: 10, scale: 2 })
    value: number;
  
    @Column('decimal', { precision: 10, scale: 2 })
    target: number;
  
    @Column({ nullable: true })
    departmentId: string;
  
    @Column({ type: 'date' })
    measurementDate: Date;
  
    @Column('text', { nullable: true })
    notes: string;
  
    @CreateDateColumn()
    createdAt: Date;
  }
  