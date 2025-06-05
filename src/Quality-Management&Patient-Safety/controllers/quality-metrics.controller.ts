@Controller('quality-metrics')
export class QualityMetricsController {
  constructor(private readonly metricsService: QualityMetricsService) {}

  @Post()
  create(@Body() dto: CreateQualityMetricDto) {
    return this.metricsService.create(dto);
  }

  @Get()
  findAll(@Query() filters: any) {
    return this.metricsService.findAll(filters);
  }

  @Get('dashboard')
  getDashboard() {
    return this.metricsService.getDashboardMetrics();
  }

  @Get('trends/:type')
  getTrends(@Param('type') type: MetricType, @Query('departmentId') departmentId?: string) {
    return this.metricsService.getMetricTrends(type, departmentId);
  }
}
