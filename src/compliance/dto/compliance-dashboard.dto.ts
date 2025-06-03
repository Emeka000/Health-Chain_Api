import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ComplianceMetricsDto {
  @ApiProperty({ description: 'Overall compliance percentage' })
  @Expose()
  overallComplianceRate: number;

  @ApiProperty({ description: 'Number of compliant requirements' })
  @Expose()
  compliantCount: number;

  @ApiProperty({ description: 'Number of non-compliant requirements' })
  @Expose()
  nonCompliantCount: number;

  @ApiProperty({ description: 'Number of pending assessments' })
  @Expose()
  pendingAssessments: number;

  @ApiProperty({ description: 'Number of overdue assessments' })
  @Expose()
  overdueAssessments: number;

  @ApiProperty({ description: 'Number of open findings' })
  @Expose()
  openFindings: number;

  @ApiProperty({ description: 'Number of critical findings' })
  @Expose()
  criticalFindings: number;
}

export class TrainingMetricsDto {
  @ApiProperty({ description: 'Overall training completion rate' })
  @Expose()
  completionRate: number;

  @ApiProperty({ description: 'Number of employees with current training' })
  @Expose()
  currentlyTrained: number;

  @ApiProperty({ description: 'Number of employees with expired training' })
  @Expose()
  expiredTraining: number;

  @ApiProperty({ description: 'Number of overdue training assignments' })
  @Expose()
  overdueTraining: number;

  @ApiProperty({ description: 'Average competency score' })
  @Expose()
  averageCompetencyScore: number;
}

export class HipaaMetricsDto {
  @ApiProperty({ description: 'Number of PHI access events today' })
  @Expose()
  phiAccessesToday: number;

  @ApiProperty({ description: 'Number of suspicious activities' })
  @Expose()
  suspiciousActivities: number;

  @ApiProperty({ description: 'Number of potential violations' })
  @Expose()
  potentialViolations: number;

  @ApiProperty({ description: 'Number of security incidents' })
  @Expose()
  securityIncidents: number;

  @ApiProperty({ description: 'Average risk score' })
  @Expose()
  averageRiskScore: number;
}

export class ComplianceDashboardDto {
  @ApiProperty({ type: ComplianceMetricsDto })
  @Expose()
  @Type(() => ComplianceMetricsDto)
  compliance: ComplianceMetricsDto;

  @ApiProperty({ type: TrainingMetricsDto })
  @Expose()
  @Type(() => TrainingMetricsDto)
  training: TrainingMetricsDto;

  @ApiProperty({ type: HipaaMetricsDto })
  @Expose()
  @Type(() => HipaaMetricsDto)
  hipaa: HipaaMetricsDto;

  @ApiProperty({ description: 'Last update timestamp' })
  @Expose()
  lastUpdated: Date;
}
