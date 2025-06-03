import { Controller, Get, Post, Body, Param, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '../../guards/auth.guard';
import { MedicalDeviceService } from './medical-device.service';
import { DeviceDataDto, DeviceRegistrationDto } from './dto/medical-device.dto';

@ApiTags('Medical Devices')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('devices')
export class MedicalDeviceController {
  constructor(private medicalDeviceService: MedicalDeviceService) {}

  @Version('1')
  @Get()
  @ApiOperation({ summary: 'Get registered medical devices' })
  async getDevices() {
    return this.medicalDeviceService.getDevices();
  }

  @Version('1')
  @Post('register')
  @ApiOperation({ summary: 'Register new medical device' })
  async registerDevice(@Body() registrationDto: DeviceRegistrationDto) {
    return this.medicalDeviceService.registerDevice(registrationDto);
  }

  @Version('1')
  @Post('data')
  @ApiOperation({ summary: 'Receive data from medical device' })
  @Throttle({ default: { limit: 1000, ttl: 60000 } })
  async receiveDeviceData(@Body() deviceDataDto: DeviceDataDto) {
    return this.medicalDeviceService.processDeviceData(deviceDataDto);
  }

  @Version('1')
  @Get(':deviceId/readings')
  @ApiOperation({ summary: 'Get device readings' })
  async getDeviceReadings(@Param('deviceId') deviceId: string) {
    return this.medicalDeviceService.getDeviceReadings(deviceId);
  }

  @Version('1')
  @Get('patient/:patientId/vitals')
  @ApiOperation({ summary: 'Get patient vital signs from devices' })
  async getPatientVitals(@Param('patientId') patientId: string) {
    return this.medicalDeviceService.getPatientVitals(patientId);
  }
}
