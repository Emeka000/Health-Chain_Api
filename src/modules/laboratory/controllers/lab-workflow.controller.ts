import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { LabWorkflowService } from '../services/lab-workflow.service';
import { CreateLabWorkflowDto, UpdateLabWorkflowDto } from '../dto/lab-workflow.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('lab-workflows')
@UseGuards(JwtAuthGuard)
export class LabWorkflowController {
  constructor(private readonly labWorkflowService: LabWorkflowService) {}

  @Post()
  create(@Body() createLabWorkflowDto: CreateLabWorkflowDto) {
    return this.labWorkflowService.create(createLabWorkflowDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.labWorkflowService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.labWorkflowService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLabWorkflowDto: UpdateLabWorkflowDto) {
    return this.labWorkflowService.update(id, updateLabWorkflowDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.labWorkflowService.remove(id);
  }

  @Post(':id/start')
  startStep(@Param('id') id: string, @Body() startData: any) {
    return this.labWorkflowService.startStep(id, startData);
  }

  @Post(':id/complete')
  completeStep(@Param('id') id: string, @Body() completionData: any) {
    return this.labWorkflowService.completeStep(id, completionData);
  }

  @Post('automation/trigger')
  triggerAutomation(@Body() automationData: any) {
    return this.labWorkflowService.triggerAutomation(automationData);
  }

  @Get('order/:orderId/status')
  getOrderWorkflowStatus(@Param('orderId') orderId: string) {
    return this.labWorkflowService.getOrderWorkflowStatus(orderId);
  }
}
