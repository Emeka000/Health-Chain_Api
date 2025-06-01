import { Controller, Post, Get, Param, Body, Patch } from '@nestjs/common';
import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { CreateSpecimenDto } from './dto/create-specimen.dto';
import { EnterLabResultDto } from './dto/enter-lab-result.dto';
import { ScheduleTestDto } from './dto/schedule-test.dto';
import { UpdateLabTestDto } from './dto/update-lab-test.dto';
import { LabService } from './services/lab.service';

@Controller('lab')
export class LabController {
  constructor(private readonly labService: LabService) {}

  // Lab Tests
  @Post('tests')
  createLabTest(@Body() dto: CreateLabTestDto) {
    return this.labService.createLabTest(dto);
  }

  @Patch('tests/:id')
  updateLabTest(@Param('id') id: string, @Body() dto: UpdateLabTestDto) {
    return this.labService.updateLabTest(+id, dto);
  }

  // Specimen Collection
  @Post('specimens')
  collectSpecimen(@Body() dto: CreateSpecimenDto) {
    return this.labService.collectSpecimen(dto);
  }

  // Test Ordering / Scheduling
  @Post('orders')
  scheduleTest(@Body() dto: ScheduleTestDto) {
    return this.labService.scheduleTest(dto);
  }

  // Lab Results
  @Post('results')
  enterLabResult(@Body() dto: EnterLabResultDto) {
    return this.labService.enterLabResult(dto);
  }

  @Patch('results/:id/validate')
  validateLabResult(
    @Param('id') resultId: string,
    @Body('validatorId') validatorId: string,
  ) {
    return this.labService.validateLabResult(+resultId, validatorId);
  }

  // Quality Control
  @Post('quality-control')
  recordQualityControl(
    @Body('testCode') testCode: string,
    @Body('controlType') controlType: string,
    @Body('controlResults') controlResults: Record<string, number>,
  ) {
    return this.labService.recordQualityControl(
      testCode,
      controlType,
      controlResults,
    );
  }
}
