import { Controller, Post, Body, Get, Param, Patch } from '@nestjs/common';
import { TreatmentPlanService,  } from './treatment-plan.service'
import { CreateTreatmentPlanDto } from './dto/create-treatment-plan.dto'

@Controller('treatment-plans')
export class TreatmentPlanController {
  constructor(private readonly service: TreatmentPlanService) {}

  @Post()
  create(@Body() dto: CreateTreatmentPlanDto) {
    return this.service.create(dto);
  }

  @Get('diagnosis/:diagnosisId')
  findByDiagnosis(@Param('diagnosisId') diagnosisId: string) {
    return this.service.findByDiagnosis(diagnosisId);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string) {
    return this.service.completePlan(id);
  }

  @Patch(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.service.cancelPlan(id);
  }
}