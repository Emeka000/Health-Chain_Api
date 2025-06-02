import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { QualityMetricsService } from "./quality-metrics.service"
import { QualityMetricsController } from "./quality-metrics.controller"
import { QualityMetric } from "./entities/quality-metric.entity"

@Module({
  imports: [TypeOrmModule.forFeature([QualityMetric])],
  controllers: [QualityMetricsController],
  providers: [QualityMetricsService],
  exports: [QualityMetricsService],
})
export class QualityMetricsModule {}
