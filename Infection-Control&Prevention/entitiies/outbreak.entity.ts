export enum OutbreakStatus {
    INVESTIGATION = 'investigation',
    CONFIRMED = 'confirmed',
    CONTROLLED = 'controlled',
    CLOSED = 'closed'
  }
  
  @Entity('outbreaks')
  export class Outbreak {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    name: string;
  
    @Column()
    pathogen: string;
  
    @Column()
    affectedUnit: string;
  
    @Column({ type: 'enum', enum: OutbreakStatus })
    status: OutbreakStatus;
  
    @Column({ type: 'date' })
    startDate: Date;
  
    @Column({ type: 'date', nullable: true })
    endDate: Date;
  
    @Column({ type: 'int', default: 0 })
    confirmedCases: number;
  
    @Column({ type: 'int', default: 0 })
    suspectedCases: number;
  
    @Column({ type: 'text', nullable: true })
    sourceInvestigation: string;
  
    @Column({ type: 'text', nullable: true })
    controlMeasures: string;
  
    @Column()
    investigationLead: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }