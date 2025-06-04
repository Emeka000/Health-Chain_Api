import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrescriptionService } from '../services/prescription.service';
import { CreatePrescriptionDto } from '../dto/prescription.dto';

@ApiTags('Prescription & Medication Management')
@Controller('clinical/prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  @ApiOperation({ summary: 'Create new prescription' })
  @ApiResponse({ status: 201, description: 'Prescription created successfully' })
  async createPrescription(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionService.create(createPrescriptionDto);
  }

  @Get('patient/:patientId')
  @ApiOperation({ summary: 'Get prescriptions by patient ID' })
  async getPrescriptionsByPatient(@Param('patientId') patientId: string) {
    return this.prescriptionService.findByPatient(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prescription by ID' })
  async getPrescription(@Param('id') id: string) {
    return this.prescriptionService.findOne(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update prescription status' })
  async updatePrescriptionStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.prescriptionService.updateStatus(id, status);
  }

  @Post(':id/refill')
  @ApiOperation({ summary: 'Process prescription refill' })
  async processRefill(@Param('id') id: string) {
    return this.prescriptionService.processRefill(id);
  }

  @Get('medications/search')
  @ApiOperation({ summary: 'Search medications' })
  async searchMedications(@Param('query') query: string) {
    return this.prescriptionService.searchMedications(query);
  }
}
