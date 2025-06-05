import { Controller, Get, Post, Body, Param, Query, Patch } from '@nestjs/common';

@Controller('incident-reports')
export class IncidentReportController {
  constructor(private readonly incidentService: IncidentReportService) {}

  @Post()
  create(@Body() dto: CreateIncidentReportDto) {
    return this.incidentService.create(dto);
  }

  @Get()
  findAll(@Query() filters: any) {
    return this.incidentService.findAll(filters);
  }

  @Get('statistics')
  getStatistics() {
    return this.incidentService.getIncidentStatistics();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: IncidentStatus) {
    return this.incidentService.updateStatus(id, status);
  }

  @Post(':id/root-cause-analysis')
  createRCA(@Param('id') id: string, @Body() analysis: any) {
    return this.incidentService.createRootCauseAnalysis(id, analysis);
  }

  @Post(':id/corrective-actions')
  createAction(@Param('id') id: string, @Body() action: any) {
    return this.incidentService.createCorrectiveAction(id, action);
  }
}
