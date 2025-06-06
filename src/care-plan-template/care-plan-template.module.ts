import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarePlanTemplate } from './entities/care-plan-template.entity';
import { CarePlanTemplateService } from './care-plan-template.service';
import { CarePlanTemplateController } from './care-plan-template.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CarePlanTemplate])],
  providers: [CarePlanTemplateService],
  controllers: [CarePlanTemplateController],
})
export class CarePlanTemplateModule {}
