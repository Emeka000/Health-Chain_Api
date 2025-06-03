import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { SafetyAlert } from '../entities/safety-alert.entity';
import { SafetyAlertService } from '../services/safety-alert.service';

@Controller('safety-alerts')
export class SafetyAlertController {
  constructor(private readonly safetyAlertService: SafetyAlertService) {}

  @Get()
  async getActiveAlerts(): Promise<SafetyAlert[]> {
    return await this.safetyAlertService.getActiveAlerts();
  }

  @Put(':id/resolve')
  async resolveAlert(
    @Param('id') id: string,
    @Body() body: { pharmacistId: string; resolution: string },
  ): Promise<SafetyAlert> {
    return await this.safetyAlertService.resolveAlert(
      id,
      body.pharmacistId,
      body.resolution,
    );
  }
}
