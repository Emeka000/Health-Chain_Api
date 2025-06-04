import { Controller, Get, Post, Body, UseGuards, Request, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { HealthRecordService } from './health-record.service';

@Controller('health-records')
@UseGuards(JwtAuthGuard)
export class HealthRecordController {
  constructor(private healthRecordService: HealthRecordService) {}

  @Get()
  async getRecords(@Request() req, @Query('type') type?: string) {
    if (type) {
      return this.healthRecordService.getRecordsByType(req.user.sub, type);
    }
    return this.healthRecordService.getPatientRecords(req.user.sub);
  }

  @Post()
  async createRecord(@Request() req, @Body() recordData: any) {
    return this.healthRecordService.createRecord(req.user.sub, recordData);
  }
}