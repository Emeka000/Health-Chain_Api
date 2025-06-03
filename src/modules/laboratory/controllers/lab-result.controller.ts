import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { LabResultService } from '../services/lab-result.service';
import { CreateLabResultDto, UpdateLabResultDto } from '../dto/lab-result.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('lab-results')
@UseGuards(JwtAuthGuard)
export class LabResultController {
  constructor(private readonly labResultService: LabResultService) {}

  @Post()
  create(@Body() createLabResultDto: CreateLabResultDto) {
    return this.labResultService.create(createLabResultDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.labResultService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.labResultService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLabResultDto: UpdateLabResultDto) {
    return this.labResultService.update(id, updateLabResultDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.labResultService.remove(id);
  }

  @Post(':id/verify')
  verifyResult(@Param('id') id: string, @Body() verificationData: any) {
    return this.labResultService.verifyResult(id, verificationData);
  }

  @Post(':id/interpret')
  interpretResult(@Param('id') id: string) {
    return this.labResultService.interpretResult(id);
  }

  @Get('order/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.labResultService.findByOrder(orderId);
  }

  @Get('abnormal/alerts')
  getAbnormalResults(@Query() query: any) {
    return this.labResultService.getAbnormalResults(query);
  }
}
