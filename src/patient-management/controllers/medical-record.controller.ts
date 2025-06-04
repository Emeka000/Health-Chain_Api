import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { CreateMedicalRecordDto } from '../dto/create-medical-record.dto';
import { MedicalRecordService } from '../services/medical-record.service';
// import { MedicalRecordService } from './medical-record.service';
// import { CreateMedicalRecordDto } from './dto/create-medical-record.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/patients/:patientId/medical-records')
@UseGuards(JwtAuthGuard)
export class MedicalRecordController {
  constructor(private readonly medicalRecordService: MedicalRecordService) {}

  @Post()
  async create(@Param('patientId') patientId: string, @Body() createMedicalRecordDto: CreateMedicalRecordDto) {
    return await this.medicalRecordService.create(patientId, createMedicalRecordDto);
  }

  @Get()
  async findByPatient(@Param('patientId') patientId: string) {
    return await this.medicalRecordService.findByPatient(patientId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.medicalRecordService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<CreateMedicalRecordDto>) {
    return await this.medicalRecordService.update(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.medicalRecordService.delete(id);
    return { message: 'Medical record deleted successfully' };
  }
}
