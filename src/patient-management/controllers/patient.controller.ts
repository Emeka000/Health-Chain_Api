import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { CreatePatientDto } from 'src/dto/create-patient.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { PatientService } from 'src/patient/patient.service';
// import { PatientService } from './patient.service';
// import { CreatePatientDto } from './dto/create-patient.dto';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/patients')
@UseGuards(JwtAuthGuard)
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  async create(@Body() createPatientDto: CreatePatientDto) {
    return await this.patientService.create(createPatientDto);
  }

  @Get()
  async findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return await this.patientService.findAll(page, limit);
  }

  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return await this.patientService.search(query, page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.patientService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updatePatientDto: Partial<CreatePatientDto>) {
    return await this.patientService.update(id, updatePatientDto);
  }

  @Delete(':id')
  async deactivate(@Param('id') id: string) {
    return await this.patientService.deactivate(id);
  }
}
