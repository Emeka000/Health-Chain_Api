import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { Prescription } from '../entities/prescription.entity';
import { PrescriptionService, CreatePrescriptionDto } from '../services/prescription.service';


@Controller('prescriptions')
export class PrescriptionController {
  constructor(private readonly prescriptionService: PrescriptionService) {}

  @Post()
  async create(@Body() createDto: CreatePrescriptionDto): Promise<Prescription> {
    return await this.prescriptionService.createPrescription(createDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Prescription> {
    return await this.prescriptionService.findById(id);
  }

  @Put(':id/verify')
  async verify(
    @Param('id') id: string,
    @Body() body: { pharmacistId: string }
  ): Promise<Prescription> {
    return await this.prescriptionService.verifyPrescription(id, body.pharmacistId);
  }

  @Put(':id/fill')
  async fill(
    @Param('id') id: string,
    @Body() body: { pharmacistId: string }
  ): Promise<Prescription> {
    return await this.prescriptionService.fillPrescription(id, body.pharmacistId);
  }

  @Put(':id/dispense')
  async dispense(
    @Param('id') id: string,
    @Body() body: { pharmacistId: string }
  ): Promise<Prescription> {
    return await this.prescriptionService.dispensePrescription(id, body.pharmacistId);
  }
}