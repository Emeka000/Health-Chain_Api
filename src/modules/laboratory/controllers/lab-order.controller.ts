import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { LabOrderService } from '../services/lab-order.service';
import { CreateLabOrderDto, UpdateLabOrderDto } from '../dto/lab-order.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('lab-orders')
@UseGuards(JwtAuthGuard)
export class LabOrderController {
  constructor(private readonly labOrderService: LabOrderService) {}

  @Post()
  create(@Body() createLabOrderDto: CreateLabOrderDto) {
    return this.labOrderService.create(createLabOrderDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.labOrderService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.labOrderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLabOrderDto: UpdateLabOrderDto) {
    return this.labOrderService.update(id, updateLabOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.labOrderService.remove(id);
  }

  @Post(':id/collect')
  collectSample(@Param('id') id: string, @Body() collectionData: any) {
    return this.labOrderService.collectSample(id, collectionData);
  }

  @Post(':id/process')
  processOrder(@Param('id') id: string) {
    return this.labOrderService.processOrder(id);
  }

  @Post(':id/complete')
  completeOrder(@Param('id') id: string, @Body() completionData: any) {
    return this.labOrderService.completeOrder(id, completionData);
  }

  @Get(':id/workflow')
  getWorkflow(@Param('id') id: string) {
    return this.labOrderService.getWorkflow(id);
  }
}

