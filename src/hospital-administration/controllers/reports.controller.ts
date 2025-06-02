import { Controller, Get, Post, Query, Body, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ReportsService } from '../services/reports.service';
import { ReportFilter, ApiResponse as CustomApiResponse } from '../interfaces/common.interface';

@ApiTags('Reports & Analytics')
@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard overview' })
  async getDashboardOverview(@Query() query: any): Promise<CustomApiResponse<any>> {
    const dashboard = await this.reportsService.getDashboardOverview(query);
    return {
      success: true,
      data: dashboard
    };
  }

  @Get('occupancy')
  @ApiOperation({ summary: 'Get bed occupancy report' })
  @ApiQuery({ name: 'type', required: false, enum: ['daily', 'weekly', 'monthly'] })
  @ApiQuery({ name: 'departmentId', required: false, type: String })
  async getOccupancyReport(@Query() filter: ReportFilter): Promise<CustomApiResponse<any>> {
    const report = await this.reportsService.getOccupancyReport(filter);
    return {
      success: true,
      data: report
    };
  }

  @Get('staff-utilization')
  @ApiOperation({ summary: 'Get staff utilization report' })
  async getStaffUtilizationReport(@Query() filter: ReportFilter): Promise<CustomApiResponse<any>> {
    const report = await this.reportsService.getStaffUtilizationReport(filter);
    return {
      success: true,
      data: report
    };
  }

  @Get('financial-summary')
  @ApiOperation({ summary: 'Get financial summary report' })
  async getFinancialSummary(@Query() filter: ReportFilter): Promise<CustomApiResponse<any>> {
    const report = await this.reportsService.getFinancialSummary(filter);
    return {
      success: true,
      data: report
    };
  }

  @Get('patient-demographics')
  @ApiOperation({ summary: 'Get patient demographics report' })
  async getPatientDemographics(@Query() filter: ReportFilter): Promise<CustomApiResponse<any>> {
    const report = await this.reportsService.getPatientDemographics(filter);
    return {
      success: true,
      data: report
    };
  }

  @Get('resource-utilization')
  @ApiOperation({ summary: 'Get resource utilization report' })
  async getResourceUtilization(@Query() filter: ReportFilter): Promise<CustomApiResponse<any>> {
    const report = await this.reportsService.getResourceUtilization(filter);
    return {
      success: true,
      data: report
    };
  }

  @Get('department-performance')
  @ApiOperation({ summary: 'Get department performance report' })
  async getDepartmentPerformance(@Query() filter: ReportFilter): Promise<CustomApiResponse<any>> {
    const report = await this.reportsService.getDepartmentPerformance(filter);
    return {
      success: true,
      data: report
    };
  }

  @Post('custom')
  @ApiOperation({ summary: 'Generate custom report' })
  async generateCustomReport(@Body() reportConfig: any): Promise<CustomApiResponse<any>> {
    const report = await this.reportsService.generateCustomReport(reportConfig);
    return {
      success: true,
      data: report,
      message: 'Custom report generated successfully'
    };
  }

  @Get('export/:type')
  @ApiOperation({ summary: 'Export report data' })
  @ApiQuery({ name: 'format', required: false, enum: ['csv', 'excel', 'pdf'] })
  async exportReport(
    @Param('type') type: string,
    @Query() filter: ReportFilter & { format?: string }
  ): Promise<CustomApiResponse<any>> {
    const exportData = await this.reportsService.exportReport(type, filter);
    return {
      success: true,
      data: exportData,
      message: 'Report exported successfully'
    };
  }

  @Get('kpi')
  @ApiOperation({ summary: 'Get key performance indicators' })
  async getKPIs(@Query() filter: ReportFilter): Promise<CustomApiResponse<any>> {
    const kpis = await this.reportsService.getKPIs(filter);
    return {
      success: true,
      data: kpis
    };
  }

  @Get('trends')
  @ApiOperation({ summary: 'Get trends analysis' })
  async getTrendsAnalysis(@Query() filter: ReportFilter): Promise<CustomApiResponse<any>> {
    const trends = await this.reportsService.getTrendsAnalysis(filter);
    return {
      success: true,
      data: trends
    };
  }
}