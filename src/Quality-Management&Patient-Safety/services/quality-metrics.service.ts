@Injectable()
export class QualityMetricsService {
  constructor(
    @InjectRepository(QualityMetric)
    private metricsRepository: Repository<QualityMetric>
  ) {}

  async create(dto: CreateQualityMetricDto): Promise<QualityMetric> {
    const metric = this.metricsRepository.create({
      ...dto,
      measurementDate: new Date(dto.measurementDate)
    });
    return this.metricsRepository.save(metric);
  }

  async findAll(filters?: any): Promise<QualityMetric[]> {
    const query = this.metricsRepository.createQueryBuilder('metric');

    if (filters?.type) {
      query.andWhere('metric.type = :type', { type: filters.type });
    }
    if (filters?.departmentId) {
      query.andWhere('metric.departmentId = :departmentId', { departmentId: filters.departmentId });
    }
    if (filters?.dateFrom) {
      query.andWhere('metric.measurementDate >= :dateFrom', { dateFrom: filters.dateFrom });
    }
    if (filters?.dateTo) {
      query.andWhere('metric.measurementDate <= :dateTo', { dateTo: filters.dateTo });
    }

    return query.orderBy('metric.measurementDate', 'DESC').getMany();
  }

  async getMetricTrends(type: MetricType, departmentId?: string): Promise<any> {
    const query = this.metricsRepository
      .createQueryBuilder('metric')
      .where('metric.type = :type', { type })
      .orderBy('metric.measurementDate', 'ASC');

    if (departmentId) {
      query.andWhere('metric.departmentId = :departmentId', { departmentId });
    }

    const metrics = await query.getMany();
    return {
      type,
      data: metrics.map(m => ({
        date: m.measurementDate,
        value: m.value,
        target: m.target,
        performance: (m.value / m.target) * 100
      }))
    };
  }

  async getDashboardMetrics(): Promise<any> {
    const latestMetrics = await this.metricsRepository
      .createQueryBuilder('metric')
      .distinctOn(['metric.type'])
      .orderBy('metric.type')
      .addOrderBy('metric.measurementDate', 'DESC')
      .getMany();

    return latestMetrics.map(metric => ({
      type: metric.type,
      name: metric.name,
      value: metric.value,
      target: metric.target,
      performance: ((metric.value / metric.target) * 100).toFixed(1),
      status: metric.value >= metric.target ? 'meeting' : 'below',
      lastUpdated: metric.measurementDate
    }));
  }
}

