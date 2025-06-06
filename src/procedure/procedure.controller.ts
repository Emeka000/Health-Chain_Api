import { Controller, Post, Body, Patch, Param, Get } from '@nestjs/common';
import { ProcedureService } from './procedure.service';
import { ScheduleProcedureDto } from './dto/schedule-procedure.dto'
import { UpdateProcedureStatusDto } from './dto/update-procedure-status.dto'

@Controller('procedures')
export class ProcedureController {
  constructor(private readonly service: ProcedureService) {}

  @Post()
  schedule(@Body() dto: ScheduleProcedureDto) {
    return this.service.schedule(dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateProcedureStatusDto
  ) {
    return this.service.updateStatus(id, dto);
  }

  @Get('plan/:planId')
  getByPlan(@Param('planId') planId: string) {
    return this.service.findByPlan(planId);
  }
}