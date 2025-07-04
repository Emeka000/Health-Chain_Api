import { Controller, Post, Body } from '@nestjs/common';
import { ResourceAllocationService } from './resource-allocation.service';

@Controller('resource-allocation')
export class ResourceAllocationController {
  constructor(private readonly allocationService: ResourceAllocationService) {}

  @Post('allocate-equipment')
  allocateEquipment(@Body() body: { departmentId: string; equipmentName: string; quantity: number }) {
    return this.allocationService.allocateEquipment(body.departmentId, body.equipmentName, body.quantity);
  }

  @Post('release-equipment')
  releaseEquipment(@Body() body: { departmentId: string; equipmentName: string; quantity: number }) {
    return this.allocationService.releaseEquipment(body.departmentId, body.equipmentName, body.quantity);
  }

  @Post('optimize-equipment')
  optimizeEquipment() {
    return this.allocationService.optimizeEquipmentAllocation();
  }
} 