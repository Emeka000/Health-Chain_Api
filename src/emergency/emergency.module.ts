import { Module } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { EmergencyController } from './emergency.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmergencyAlert } from './entities/emergency-alert.entity';
import { EmergencyDocumentation } from './entities/emergency-documentation.entity';
import { EmergencyResource } from './entities/emergency-resources.entity';
import { Emergency } from './entities/emergency.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Emergency,
      EmergencyAlert,
      EmergencyResource,
      EmergencyDocumentation,
    ]),
  ],
  providers: [EmergencyService],
  controllers: [EmergencyController],
  exports: [EmergencyService],
})
export class EmergencyModule {}
