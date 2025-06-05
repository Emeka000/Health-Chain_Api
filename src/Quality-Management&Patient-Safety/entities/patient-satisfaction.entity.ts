@Entity('patient_satisfaction_surveys')
export class PatientSatisfactionSurvey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  patientId: string;

  @Column({ nullable: true })
  departmentId: string;

  @Column('int')
  overallRating: number; // 1-10 scale

  @Column('int')
  careQualityRating: number;

  @Column('int')
  communicationRating: number;

  @Column('int')
  facilityRating: number;

  @Column('text', { nullable: true })
  comments: string;

  @Column('text', { nullable: true })
  suggestions: string;

  @Column()
  surveyDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}
