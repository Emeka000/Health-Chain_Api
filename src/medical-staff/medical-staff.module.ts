import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ScheduleModule } from "@nestjs/schedule"
import { Doctor } from "./entities/doctor.entity"
import { MedicalLicense } from "./entities/medical-license.entity"
import { Schedule } from "./entities/schedule.entity"
import { Department } from "./entities/department.entity"
import { Specialty } from "./entities/specialty.entity"
import { PerformanceMetric } from "./entities/performance-metric.entity"
import { CreateContinuingEducationDto } from "./dto/o create-continuing-education.dto"
import { MedicalStaffController } from "./controllers/medical-staff.controller"
import { MedicalStaffService } from "./providers/medical-staff.service"
import { LicenseRenewalService } from "./providers/license-renewal.service"
import { SchedulingService } from "./providers/scheduling.service"
import { PerformanceTrackingService } from "./providers/performance-tracking.service"
import { LicenseRenewalTasks } from "./tasks/license-renewal.tasks"

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Doctor,
      MedicalLicense,
      Schedule,
      Department,
      Specialty,
      PerformanceMetric,
      CreateContinuingEducationDto,
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [MedicalStaffController],
  providers: [
    MedicalStaffService,
    LicenseRenewalService,
    SchedulingService,
    PerformanceTrackingService,
    LicenseRenewalTasks,
  ],
  exports: [MedicalStaffService, SchedulingService],
})
export class MedicalStaffModule {}
