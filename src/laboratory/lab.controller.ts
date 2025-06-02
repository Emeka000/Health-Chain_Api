import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { LabService } from './lab.service';
import { CreateLabTestDto } from './dto/create-lab-test.dto';
import { OrderTestDto } from './dto/order-test.dto';
import { RecordResultDto } from './dto/record-result.dto';
import { UpdateSpecimenStatusDto } from './dto/update-specimen-status.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/jwt.auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enum/role.enum';

@ApiTags('laboratory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('laboratory')
export class LabController {
  constructor(private readonly labService: LabService) {}

  @Post('tests')
  @Roles(Role.ADMIN, Role.LAB_TECH)
  @ApiOperation({ summary: 'Create a lab test' })
  @ApiResponse({ status: 201, description: 'Lab test created successfully' })
  createLabTest(@Body() dto: CreateLabTestDto) {
    return this.labService.createLabTest(dto);
  }

  @Get('tests')
  @Roles(Role.ADMIN, Role.LAB_TECH, Role.DOCTOR)
  @ApiOperation({ summary: 'List all lab tests' })
  @ApiResponse({ status: 200, description: 'Return all lab tests' })
  getAllTests() {
    return this.labService.getAllLabTests();
  }

  @Post('order')
  @Roles(Role.DOCTOR)
  @ApiOperation({ summary: 'Order lab tests for a patient' })
  @ApiResponse({ status: 201, description: 'Lab test ordered' })
  orderTest(@Body() dto: OrderTestDto) {
    return this.labService.orderTests(dto);
  }

  @Post('results')
  @Roles(Role.LAB_TECH)
  @ApiOperation({ summary: 'Record results for a lab order' })
  @ApiResponse({ status: 201, description: 'Lab results recorded' })
  recordResults(@Body() dto: RecordResultDto) {
    return this.labService.recordResults(dto);
  }

  @Patch('specimens/status')
  @Roles(Role.LAB_TECH)
  @ApiOperation({ summary: 'Update specimen status' })
  @ApiResponse({ status: 200, description: 'Specimen status updated' })
  updateSpecimenStatus(@Body() dto: UpdateSpecimenStatusDto) {
    return this.labService.updateSpecimenStatus(dto);
  }

  @Get('specimens/:patientId')
  @Roles(Role.ADMIN, Role.LAB_TECH, Role.DOCTOR)
  @ApiOperation({ summary: 'Track specimens for a patient' })
  @ApiResponse({ status: 200, description: 'Return specimen tracking' })
  getSpecimens(@Param('patientId') patientId: string) {
    return this.labService.trackSpecimensByPatient(patientId);
  }

  @Post('specimens')
  @Roles(Role.LAB_TECH)
  @ApiOperation({ summary: 'Register a new specimen for a patient' })
  @ApiResponse({ status: 201, description: 'Specimen created' })
  createSpecimen(
    @Request() req,
    @Body() body: { patientId: string; specimenType: string },
  ) {
    return this.labService.createSpecimen(body);
  }
}
