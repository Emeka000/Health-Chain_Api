@Injectable()
export class RiskManagementService {
  constructor(
    @InjectRepository(RiskAssessment)
    private riskRepository: Repository<RiskAssessment>,
    @InjectRepository(MitigationStrategy)
    private mitigationRepository: Repository<MitigationStrategy>
  ) {}

  async createRiskAssessment(data: any): Promise<RiskAssessment> {
    const risk = this.riskRepository.create({
      ...data,
      nextReviewDate: new Date(data.nextReviewDate)
    });
    return this.riskRepository.save(risk);
  }

  async findAllRisks(filters?: any): Promise<RiskAssessment[]> {
    const query = this.riskRepository.createQueryBuilder('risk')
      .leftJoinAndSelect('risk.mitigationStrategies', 'strategies');

    if (filters?.riskLevel) {
      query.andWhere('risk.riskLevel = :riskLevel', { riskLevel: filters.riskLevel });
    }

    return query.getMany();
  }

  async createMitigationStrategy(riskId: string, strategy: any): Promise<MitigationStrategy> {
    const mitigation = this.mitigationRepository.create({
      ...strategy,
      riskAssessmentId: riskId,
      implementationDate: new Date(strategy.implementationDate)
    });
    return this.mitigationRepository.save(mitigation);
  }

  async getRiskMatrix(): Promise<any> {
    const risks = await this.riskRepository.find();
    
    const matrix = risks.map(risk => ({
      id: risk.id,
      title: risk.title,
      probability: risk.probability,
      impact: risk.impact,
      riskScore: risk.probability * risk.impact,
      riskLevel: risk.riskLevel
    }));

    return matrix.sort((a, b) => b.riskScore - a.riskScore);
  }
}
