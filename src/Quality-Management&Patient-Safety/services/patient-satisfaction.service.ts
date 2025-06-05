@Injectable()
export class PatientSatisfactionService {
  constructor(
    @InjectRepository(PatientSatisfactionSurvey)
    private surveyRepository: Repository<PatientSatisfactionSurvey>
  ) {}

  async create(dto: CreatePatientSatisfactionDto): Promise<PatientSatisfactionSurvey> {
    const survey = this.surveyRepository.create({
      ...dto,
      surveyDate: new Date(dto.surveyDate)
    });
    return this.surveyRepository.save(survey);
  }

  async findAll(filters?: any): Promise<PatientSatisfactionSurvey[]> {
    const query = this.surveyRepository.createQueryBuilder('survey');

    if (filters?.departmentId) {
      query.andWhere('survey.departmentId = :departmentId', { departmentId: filters.departmentId });
    }
    if (filters?.dateFrom) {
      query.andWhere('survey.surveyDate >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    return query.orderBy('survey.surveyDate', 'DESC').getMany();
  }

  async getSatisfactionReport(departmentId?: string): Promise<any> {
    const query = this.surveyRepository.createQueryBuilder('survey');
    
    if (departmentId) {
      query.where('survey.departmentId = :departmentId', { departmentId });
    }

    const surveys = await query.getMany();
    
    const totalSurveys = surveys.length;
    const averages = {
      overall: surveys.reduce((sum, s) => sum + s.overallRating, 0) / totalSurveys,
      careQuality: surveys.reduce((sum, s) => sum + s.careQualityRating, 0) / totalSurveys,
      communication: surveys.reduce((sum, s) => sum + s.communicationRating, 0) / totalSurveys,
      facility: surveys.reduce((sum, s) => sum + s.facilityRating, 0) / totalSurveys
    };

    const comments = surveys.filter(s => s.comments).map(s => ({
      rating: s.overallRating,
      comment: s.comments,
      date: s.surveyDate
    }));

    return {
      totalSurveys,
      averages,
      comments: comments.slice(0, 10) // Latest 10 comments
    };
  }
}
