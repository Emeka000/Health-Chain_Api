import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      IncidentReport,
      RootCauseAnalysis,
      CorrectiveAction,
      QualityMetric,
      PatientSatisfactionSurvey,
      RiskAssessment,
      MitigationStrategy,
      PeerReview
    ])
  ],
  controllers: [
    IncidentReportController,
    QualityMetricsController,
    PatientSatisfactionController,
    RiskManagementController
  ],
  providers: [
    IncidentReportService,
    QualityMetricsService,
    PatientSatisfactionService,
    RiskManagementService
  ],
  exports: [
    IncidentReportService,
    QualityMetricsService,
    PatientSatisfactionService,
    RiskManagementService
  ]
})
export class QualityManagementModule {}