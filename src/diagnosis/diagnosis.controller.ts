import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { DiagnosisService } from './diagnosis.service';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto'

@Controller('diagnoses')
export class DiagnosisController {
  constructor(private readonly service: DiagnosisService) {}

  @Post()
  create(@Body() dto: CreateDiagnosisDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string) {
    return this.service.findByPatient(patientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}