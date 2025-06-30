import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
} from '@nestjs/common';
import { BedService } from './bed.service';
import { BedStatus } from './entities/bed.entity';

@Controller('beds')
export class BedController {
  constructor(private readonly bedService: BedService) {}

  @Post()
  create(@Body() data: any) {
    return this.bedService.create(data);
  }

  @Get()
  findAll() {
    return this.bedService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bedService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.bedService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bedService.remove(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: BedStatus) {
    return this.bedService.updateStatus(id, status);
  }

  @Patch(':id/assign')
  assignToPatient(
    @Param('id') id: string,
    @Body('patientId') patientId: string,
  ) {
    return this.bedService.assignToPatient(id, patientId);
  }

  @Patch(':id/release')
  releaseBed(@Param('id') id: string) {
    return this.bedService.releaseBed(id);
  }
}
