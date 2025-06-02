import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
  } from 'typeorm';
  import { Regulation } from './regulation.entity';
  import { ComplianceAssessment } from './compliance-assessment.entity';
  import { PolicyProcedure } from './policy-procedure.entity';
  
  export enum RequirementType {
    TECHNICAL = 'technical',
    ADMINISTRATIVE = 'administrative',
    PHYSICAL = 'physical',
    OPERATIONAL = 'operational',
    TRAINING = 'training',
    DOCUMENTATION = 'documentation',
  }
  
  export enum ComplianceLevel {
    REQUIRED = 'required',
    ADDRESSABLE = 'addressable',
    RECOMMENDED = 'recommended',
  }
  
  export enum RiskLevel {
    CRITICAL = 'critical',
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
  }
  
  @Entity('compliance_requirements')
  @Index(['regulationId', 'type'])
  @Index(['riskLevel', 'complianceLevel'])
  export class ComplianceRequirement {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ name: 'regulation_id' })
    regulationId: number;
  
    @Column({ unique: true })
    code: string;
  
    @Column()
    title: string;
  
    @Column('text')
    description: string;
  
    @Column({
      type: 'enum',
      enum: RequirementType,
    })
    type: RequirementType;
  
    @Column({
      type: 'enum',
      enum: ComplianceLevel,
    })
    complianceLevel: ComplianceLevel;
  
    @Column({
      type: 'enum',
      enum: RiskLevel,
    })
    riskLevel: RiskLevel;
  
    @Column('text', { nullable: true })
    implementation_guidance?: string;
  
    @Column({ name: 'assessment_frequency_days' })
    assessmentFrequencyDays: number;
  
    @Column({ name: 'next_assessment_due' })
    nextAssessmentDue: Date;
  
    @Column({ default: true })
    active: boolean;
  
    @Column({ type: 'json', nullable: true })
    controls?: Record<string, any>;
  
    @ManyToOne(() => Regulation, regulation => regulation.requirements)
    @JoinColumn({ name: 'regulation_id' })
    regulation: Regulation;
  
    @OneToMany(() => ComplianceAssessment, assessment => assessment.requirement)
    assessments: ComplianceAssessment[];
  
    @OneToMany(() => PolicyProcedure, policy => policy.requirement)
    policies: PolicyProcedure[];
  
    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
  }
  