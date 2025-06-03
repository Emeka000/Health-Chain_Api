import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { LabAnalyticsService } from '../services/lab-analytics.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('lab-analytics')
@UseGuards(JwtAuthGuard)
export class LabAnalyticsController {
  constructor(private readonly labAnalyticsService: LabAnalyticsService) {}

  @Get('dashboard')
  getDashboard(@Query() query: any) {
    return this.labAnalyticsService.getDashboard(query);
  }

  @Get('performance')
  getPerformanceMetrics(@Query() query: any) {
    return this.labAnalyticsService.getPerformanceMetrics(query);
  }

  @Get('turnaround-time')
  getTurnaroundTimeAnalysis(@Query() query: any) {
    return this.labAnalyticsService.getTurnaroundTimeAnalysis(query);
  }

  @Get('quality-metrics')
  getQualityMetrics(@Query() query: any) {
    return this.labAnalyticsService.getQualityMetrics(query);
  }

  @Get('volume-trends')
  getVolumeTrends(@Query() query: any) {
    return this.labAnalyticsService.getVolumeTrends(query);
  }

  @Get('equipment-utilization')
  getEquipmentUtilization(@Query() query: any) {
    return this.labAnalyticsService.getEquipmentUtilization(query);
  }

  @Get('cost-analysis')
  getCostAnalysis(@Query() query: any) {
    return this.labAnalyticsService.getCostAnalysis(query);
  }

  @Get('productivity')
  getProductivityMetrics(@Query() query: any) {
    return this.labAnalyticsService.getProductivityMetrics(query);
  }
}
