import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { LabReportService } from '../services/lab-report.service';
import { CreateLabReportDto, UpdateLabReportDto } from '../dto/lab-report.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('lab-reports')
@UseGuards(JwtAuthGuard)
export class LabReportController {
  constructor(private readonly labReportService: LabReportService) {}

  @Post()
  create(@Body() createLabReportDto: CreateLabReportDto) {
    return this.labReportService.create(createLabReportDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.labReportService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.labReportService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLabReportDto: UpdateLabReportDto) {
    return this.labReportService.update(id, updateLabReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.labReportService.remove(id);
  }

  @Post('generate/:orderId')
  generateReport(@Param('orderId') orderId: string, @Body() reportOptions: any) {
    return this.labReportService.generateReport(orderId, reportOptions);
  }

  @Get(':id/download')
  async downloadReport(@Param('id') id: string, @Res() res: Response) {
    const report = await this.labReportService.downloadReport(id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="lab-report-${id}.pdf"`
    });
    return res.send(report);
  }

  @Post(':id/approve')
  approveReport(@Param('id') id: string, @Body() approvalData: any) {
    return this.labReportService.approveReport(id, approvalData);
  }

  @Post(':id/deliver')
  deliverReport(@Param('id') id: string, @Body() deliveryData: any) {
    return this.labReportService.deliverReport(id, deliveryData);
  }

  @Get('patient/:patientId')
  getPatientReports(@Param('patientId') patientId: string, @Query() query: any) {
    return this.labReportService.getPatientReports(patientId, query);
  }
}
