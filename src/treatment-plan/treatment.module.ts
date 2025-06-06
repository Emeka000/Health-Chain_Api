import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TreatmentPlan } from './entities/treatment-plan.entity';
import { TreatmentPlanService } from './treatment-plan.service';
import { TreatmentPlanController } from './treatment-plan.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TreatmentPlan])],
  providers: [TreatmentPlanService],
  controllers: [TreatmentPlanController],
})
export class TreatmentPlanModule {}
