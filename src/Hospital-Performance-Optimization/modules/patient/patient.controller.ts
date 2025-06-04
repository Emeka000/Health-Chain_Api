import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { PatientService } from '../../patient/patient.service';
import { Patient } from '../../entities/patient.entity';

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get('search')
  async searchPatients(@Query('q') query: string): Promise<Patient[]> {
    return this.patientService.searchPatients(query);
  }

  @Get(':id')
  async getPatient(@Param('id') id: number): Promise<Patient> {
    return this.patientService.findById(id);
  }

  @Post()
  async createPatient(@Body() patientData: Partial<Patient>): Promise<Patient> {
    return this.patientService.create(patientData);
  }

  @Put(':id')
  async updatePatient(
    @Param('id') id: number,
    @Body() updateData: Partial<Patient>,
  ): Promise<Patient> {
    return this.patientService.update(id, updateData);
  }
}
