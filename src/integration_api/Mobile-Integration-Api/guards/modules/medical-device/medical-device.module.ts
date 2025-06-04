import { Module } from '@nestjs/common';
import { MedicalDeviceController } from './medical-device.controller';
import { MedicalDeviceService } from './medical-device.service';

@Module({
  controllers: [MedicalDeviceController],
  providers: [MedicalDeviceService],
})
export class MedicalDeviceModule {}
