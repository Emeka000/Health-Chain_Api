import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DiagnosisService } from '../services/diagnosis.service';
import { CreateDiagnosisDto, UpdateDiagnosisDto } from '../dto/diagnosis.dto';

@ApiTags('Diagnosis & Treatment Planning')
@Controller('clinical/diagnosis')
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @Post()
  @ApiOperation({ summary: 'Create new diagnosis' })
  @ApiResponse({ status: 201, description: 'Diagnosis created successfully' })
  async createDiagnosis(@Body() createDiagnosisDto: CreateDiagnosisDto) {
    return this.diagnosisService.create(createDiagnosisDto);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get diagnoses by patient ID' })
  async getDiagnosesByPatient(@Param('patientId') patientId: string) {
    return this.diagnosisService.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get diagnosis by ID' })
  async getDiagnosis(@Param('id') id: string) {
    return this.diagnosisService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update diagnosis' })
  async updateDiagnosis(@Param('id') id: string, @Body() updateDiagnosisDto: UpdateDiagnosisDto) {
    return this.diagnosisService.update(id, updateDiagnosisDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete diagnosis' })
  async deleteDiagnosis(@Param('id') id: string) {
    return this.diagnosisService.remove(id);
  }

  @Post(':id/treatment-plan')
  @ApiOperation({ summary: 'Create treatment plan for diagnosis' })
  async createTreatmentPlan(@Param('id') diagnosisId: string, @Body() treatmentPlanDto: any) {
    return this.diagnosisService.createTreatmentPlan(diagnosisId, treatmentPlanDto);
  }
}
