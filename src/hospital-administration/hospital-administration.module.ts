import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

// Controllers
import { HospitalController } from './controllers/hospital.controller';
import { DepartmentController } from './controllers/department.controller';
import { StaffController } from './controllers/staff.controller';
import { BedController } from './controllers/bed.controller';
import { ResourceController } from './controllers/resource.controller';
import { BillingController } from './controllers/billing.controller';
import { ReportsController } from './controllers/reports.controller';
import { ConfigurationController } from './controllers/configuration.controller';

// Services
import { HospitalService } from './services/hospital.service';
import { DepartmentService } from './services/department.service';
import { StaffService } from './services/staff.service';
import { BedService } from './services/bed.service';
import { ResourceService } from './services/resource.service';
import { BillingService } from './services/billing.service';
import { ReportsService } from './services/reports.service';
import { ConfigurationService } from './services/configuration.service';

// Entities
import { Hospital } from './entities/hospital.entity';
import { Department } from './entities/department.entity';
import { Staff } from './entities/staff.entity';
import { Bed } from './entities/bed.entity';
import { Resource } from './entities/resource.entity';
import { BedAllocation } from './entities/bed-allocation.entity';
import { ResourceAllocation } from './entities/resource-allocation.entity';
import { Patient } from './entities/patient.entity';
import { Bill } from './entities/bill.entity';
import { BillItem } from './entities/bill-item.entity';
import { Payment } from './entities/payment.entity';
import { SystemConfiguration } from './entities/system-configuration.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      Hospital,
      Department,
      Staff,
      Bed,
      Resource,
      BedAllocation,
      ResourceAllocation,
      Patient,
      Bill,
      BillItem,
      Payment,
      SystemConfiguration,
    ]),
  ],
  controllers: [
    HospitalController,
    DepartmentController,
    StaffController,
    BedController,
    ResourceController,
    BillingController,
    ReportsController,
    ConfigurationController,
  ],
  providers: [
    HospitalService,
    DepartmentService,
    StaffService,
    BedService,
    ResourceService,
    BillingService,
    ReportsService,
    ConfigurationService,
  ],
  exports: [
    HospitalService,
    DepartmentService,
    StaffService,
    BedService,
    ResourceService,
    BillingService,
    ReportsService,
    ConfigurationService,
  ],
})
export class HospitalAdministrationModule {}
