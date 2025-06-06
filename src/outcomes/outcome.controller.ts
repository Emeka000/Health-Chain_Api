import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { OutcomeService } from './outcome.service';
import { RecordOutcomeDto } from './dto/record-outcome.dto'

@Controller('outcomes')
export class OutcomeController {
  constructor(private readonly service: OutcomeService) {}

  @Post()
  record(@Body() dto: RecordOutcomeDto) {
    return this.service.record(dto);
  }

  @Get('plan/:planId')
  getByPlan(@Param('planId') planId: string) {
    return this.service.getOutcomesByPlan(planId);
  }

  @Get('plan/:planId/average')
  getAverage(@Param('planId') planId: string) {
    return this.service.getAverageImprovementByPlan(planId);
  }
}
