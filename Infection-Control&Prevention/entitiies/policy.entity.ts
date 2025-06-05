export enum PolicyType {
    INFECTION_CONTROL = 'infection-control',
    ANTIBIOTIC_STEWARDSHIP = 'antibiotic-stewardship',
    ISOLATION = 'isolation',
    HAND_HYGIENE = 'hand-hygiene',
    OUTBREAK_RESPONSE = 'outbreak-response'
  }
  
  @Entity('policies')
  export class Policy {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    title: string;
  
    @Column({ type: 'enum', enum: PolicyType })
    type: PolicyType;
  
    @Column({ type: 'text' })
    content: string;
  
    @Column()
    version: string;
  
    @Column({ type: 'date' })
    effectiveDate: Date;
  
    @Column({ type: 'date', nullable: true })
    expiryDate: Date;
  
    @Column()
    approvedBy: string;
  
    @Column({ default: true })
    isActive: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  