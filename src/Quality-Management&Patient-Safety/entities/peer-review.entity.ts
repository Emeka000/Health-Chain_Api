export enum ReviewType {
    CLINICAL = 'clinical',
    ADMINISTRATIVE = 'administrative',
    QUALITY = 'quality'
  }
  
  @Entity('peer_reviews')
  export class PeerReview {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    revieweeId: string;
  
    @Column()
    reviewerId: string;
  
    @Column({ type: 'enum', enum: ReviewType })
    type: ReviewType;
  
    @Column('text')
    criteria: string;
  
    @Column('int')
    score: number; // 1-10
  
    @Column('text')
    feedback: string;
  
    @Column('text', { nullable: true })
    recommendations: string;
  
    @Column({ type: 'date' })
    reviewDate: Date;
  
    @CreateDateColumn()
    createdAt: Date;
  }
  