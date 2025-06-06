import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CarePlanTemplateService } from './care-plan-template.service';
import { CreateCarePlanTemplateDto } from './dto/care-plan-template.dto';

@Controller('care-plan-templates')
export class CarePlanTemplateController {
  constructor(private readonly service: CarePlanTemplateService) {}

  @Post()
  create(@Body() dto: CreateCarePlanTemplateDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}
