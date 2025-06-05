export enum PrecautionType {
    STANDARD = 'standard',
    CONTACT = 'contact',
    DROPLET = 'droplet',
    AIRBORNE = 'airborne',
    PROTECTIVE = 'protective'
  }
  
  @Entity('isolation_precautions')
  export class IsolationPrecaution {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    patientId: string;
  
    @Column({ type: 'enum', enum: PrecautionType })
    type: PrecautionType;
  
    @Column({ type: 'text' })
    reason: string;
  
    @Column({ type: 'date' })
    startDate: Date;
  
    @Column({ type: 'date', nullable: true })
    endDate: Date;
  
    @Column({ type: 'text', nullable: true })
    specialInstructions: string;
  
    @Column({ default: true })
    isActive: boolean;
  
    @Column()
    orderedBy: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  