export enum ActionStatus {
    PLANNED = 'planned',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    OVERDUE = 'overdue'
  }
  
  @Entity('corrective_actions')
  export class CorrectiveAction {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column('uuid')
    incidentId: string;
  
    @ManyToOne(() => IncidentReport, incident => incident.correctiveActions)
    @JoinColumn({ name: 'incidentId' })
    incident: IncidentReport;
  
    @Column()
    title: string;
  
    @Column('text')
    description: string;
  
    @Column()
    assignedTo: string;
  
    @Column({ type: 'date' })
    dueDate: Date;
  
    @Column({ type: 'enum', enum: ActionStatus, default: ActionStatus.PLANNED })
    status: ActionStatus;
  
    @Column('text', { nullable: true })
    completionNotes: string;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  