import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { LabAccreditationService } from '../services/lab-accreditation.service';
import { CreateLabAccreditationDto, UpdateLabAccreditationDto } from '../dto/lab-accreditation.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('lab-accreditation')
@UseGuards(JwtAuthGuard)
export class LabAccreditationController {
  constructor(private readonly labAccreditationService: LabAccreditationService) {}

  @Post()
  create(@Body() createLabAccreditationDto: CreateLabAccreditationDto) {
    return this.labAccreditationService.create(createLabAccreditationDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.labAccreditationService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.labAccreditationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLabAccreditationDto: UpdateLabAccreditationDto) {
    return this.labAccreditationService.update(id, updateLabAccreditationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.labAccreditationService.remove(id);
  }

  @Get('compliance/check')
  checkCompliance(@Query() query: any) {
    return this.labAccreditationService.checkCompliance(query);
  }

  @Post('audit/schedule')
  scheduleAudit(@Body() auditData: any) {
    return this.labAccreditationService.scheduleAudit(auditData);
  }

  @Get('status/overview')
  getStatusOverview() {
    return this.labAccreditationService.getStatusOverview();
  }

  @Get('renewal/alerts')
  getRenewalAlerts() {
    return this.labAccreditationService.getRenewalAlerts();
  }
}