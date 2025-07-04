import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { Department } from './entities/department.entity';
import { Ward } from './entities/ward.entity';
import { Room } from './entities/room.entity';
import { Bed } from './entities/bed.entity';
import { WardService } from './ward.service';
import { WardController } from './ward.controller';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { BedService } from './bed.service';
import { BedController } from './bed.controller';
import { DepartmentWorkflowService } from './department-workflow.service';
import { DepartmentWorkflowController } from './department-workflow.controller';
import { ResourceAllocationService } from './resource-allocation.service';
import { ResourceAllocationController } from './resource-allocation.controller';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Department, Ward, Room, Bed])],
  controllers: [
    DepartmentsController,
    WardController,
    RoomController,
    BedController,
    DepartmentWorkflowController,
    ResourceAllocationController,
    MetricsController,
  ],
  providers: [
    DepartmentsService,
    WardService,
    RoomService,
    BedService,
    DepartmentWorkflowService,
    ResourceAllocationService,
    MetricsService,
  ],
  exports: [
    DepartmentsService,
    WardService,
    RoomService,
    BedService,
    DepartmentWorkflowService,
    ResourceAllocationService,
    MetricsService,
  ],
})
export class DepartmentsModule {}
