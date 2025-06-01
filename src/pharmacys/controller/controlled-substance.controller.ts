import { Controller, Get, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { ControlledSubstanceLog } from '../entities/controlled-substance-log.entity';
import { ControlledSubstanceService } from '../services/controlled-substance.service';

@Controller('controlled-substances')
export class ControlledSubstanceController {
  constructor(private readonly controlledSubstanceService: ControlledSubstanceService) {}

  @Post(':drugId/receive')
  async logReceiving(
    @Param('drugId') drugId: string,
    @Body() body: { quantity: number; pharmacistId: string; notes?: string }
  ): Promise<ControlledSubstanceLog> {
    return await this.controlledSubstanceService.logReceiving(
      drugId,
      body.quantity,
      body.pharmacistId,
      body.notes
    );
  }

  @Post(':drugId/destroy')
  async logDestruction(
    @Param('drugId') drugId: string,
    @Body() body: { quantity: number; pharmacistId: string; notes: string }
  ): Promise<ControlledSubstanceLog> {
    return await this.controlledSubstanceService.logDestruction(
      drugId,
      body.quantity,
      body.pharmacistId,
      body.notes
    );
  }

  @Get(':drugId/balance')
  async getCurrentBalance(@Param('drugId') drugId: string): Promise<{ balance: number }> {
    const balance = await this.controlledSubstanceService.getCurrentBalance(drugId);
    return { balance };
  }

  @Get(':drugId/history')
  async getHistory(
    @Param('drugId') drugId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ): Promise<ControlledSubstanceLog[]> {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    
    return await this.controlledSubstanceService.getTransactionHistory(
      drugId,
      start,
      end
    );
  }

  @Get('report')
  async generateReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ): Promise<any> {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }

    return await this.controlledSubstanceService.generateReport(
      new Date(startDate),
      new Date(endDate)
    );
  }
}