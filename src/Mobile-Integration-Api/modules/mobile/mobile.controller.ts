import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '../../guards/auth.guard';
import { MobileService } from './mobile.service';
import { CreatePatientDto, UpdatePatientDto } from './dto/mobile.dto';

@ApiTags('Mobile API')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('mobile')
export class MobileController {
  constructor(private mobileService: MobileService) {}

  @Version('1')
  @Get('dashboard')
  @ApiOperation({ summary: 'Get mobile dashboard data' })
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  async getDashboard() {
    return this.mobileService.getDashboard();
  }

  @Version('1')
  @Get('patients')
  @ApiOperation({ summary: 'Get patient list (mobile optimized)' })
  async getPatients() {
    return this.mobileService.getPatients();
  }

  @Version('1')
  @Post('patients')
  @ApiOperation({ summary: 'Create new patient' })
  async createPatient(@Body() createPatientDto: CreatePatientDto) {
    return this.mobileService.createPatient(createPatientDto);
  }

  @Version('1')
  @Put('patients/:id')
  @ApiOperation({ summary: 'Update patient' })
  async updatePatient(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.mobileService.updatePatient(id, updatePatientDto);
  }

  @Version('1')
  @Get('sync')
  @ApiOperation({ summary: 'Sync mobile data' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async syncData() {
    return this.mobileService.syncData();
  }
}
