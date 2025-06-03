import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { LabEquipmentService } from '../services/lab-equipment.service';
import { CreateLabEquipmentDto, UpdateLabEquipmentDto } from '../dto/lab-equipment.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('lab-equipment')
@UseGuards(JwtAuthGuard)
export class LabEquipmentController {
  constructor(private readonly labEquipmentService: LabEquipmentService) {}

  @Post()
  create(@Body() createLabEquipmentDto: CreateLabEquipmentDto) {
    return this.labEquipmentService.create(createLabEquipmentDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.labEquipmentService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.labEquipmentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLabEquipmentDto: UpdateLabEquipmentDto) {
    return this.labEquipmentService.update(id, updateLabEquipmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.labEquipmentService.remove(id);
  }

  @Post(':id/connect')
  connect(@Param('id') id: string) {
    return this.labEquipmentService.connect(id);
  }

  @Post(':id/disconnect')
  disconnect(@Param('id') id: string) {
    return this.labEquipmentService.disconnect(id);
  }

  @Get(':id/status')
  getStatus(@Param('id') id: string) {
    return this.labEquipmentService.getStatus(id);
  }

  @Post(':id/calibrate')
  calibrate(@Param('id') id: string, @Body() calibrationData: any) {
    return this.labEquipmentService.calibrate(id, calibrationData);
  }

  @Post(':id/maintenance')
  scheduleMaintenance(@Param('id') id: string, @Body() maintenanceData: any) {
    return this.labEquipmentService.scheduleMaintenance(id, maintenanceData);
  }

  @Get('status/overview')
  getStatusOverview() {
    return this.labEquipmentService.getStatusOverview();
  }
}
