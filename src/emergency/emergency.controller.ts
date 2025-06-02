import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { CreateEmergencyDto } from './dto/create-emergency.dto';
import { EmergencyService } from './emergency.service';
import { EmergencyStatus, ResourceType } from './entities/emergency.entity';

@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}

  @Post()
  async createEmergency(@Body() createEmergencyDto: CreateEmergencyDto) {
    return await this.emergencyService.createEmergency(createEmergencyDto);
  }

  @Get('queue')
  async getEmergencyQueue() {
    return await this.emergencyService.getEmergencyQueue();
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: EmergencyStatus,
  ) {
    return await this.emergencyService.updateEmergencyStatus(id, status);
  }

  @Post(':id/escalate')
  async escalateEmergency(
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    await this.emergencyService.escalateEmergency(id, reason);
    return { message: 'Emergency escalated successfully' };
  }

  @Post(':id/resources')
  async allocateResource(
    @Param('id') emergencyId: string,
    @Body()
    body: {
      resourceType: ResourceType;
      resourceId: string;
      resourceName: string;
    },
  ) {
    return await this.emergencyService.allocateResource(
      emergencyId,
      body.resourceType,
      body.resourceId,
      body.resourceName,
    );
  }

  @Post(':id/documentation')
  async addDocumentation(
    @Param('id') emergencyId: string,
    @Body()
    body: {
      documentType: string;
      content: string;
      authorId: string;
      authorName: string;
      authorRole: string;
    },
  ) {
    return await this.emergencyService.addDocumentation(
      emergencyId,
      body.documentType,
      body.content,
      body.authorId,
      body.authorName,
      body.authorRole,
    );
  }

  @Get('metrics')
  async getQualityMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.emergencyService.getQualityMetrics(
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Get('alerts')
  async getActiveAlerts() {
    // Implementation for getting active alerts
    return { message: 'Active alerts endpoint' };
  }
}
