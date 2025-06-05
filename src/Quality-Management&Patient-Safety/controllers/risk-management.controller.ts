@Controller('risk-management')
export class RiskManagementController {
  constructor(private readonly riskService: RiskManagementService) {}

  @Post('assessments')
  createAssessment(@Body() data: any) {
    return this.riskService.createRiskAssessment(data);
  }

  @Get('assessments')
  findAllAssessments(@Query() filters: any) {
    return this.riskService.findAllRisks(filters);
  }

  @Post('assessments/:id/mitigation-strategies')
  createMitigation(@Param('id') id: string, @Body() strategy: any) {
    return this.riskService.createMitigationStrategy(id, strategy);
  }

  @Get('matrix')
  getRiskMatrix() {
    return this.riskService.getRiskMatrix();
  }
}