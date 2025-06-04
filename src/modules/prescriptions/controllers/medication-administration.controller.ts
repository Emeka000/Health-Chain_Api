import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MedicationAdministrationService } from '../services/medication-administration.service';
import { CreateMedicationAdministrationDto } from '../dto/create-medication-administration.dto';
import { UpdateMedicationAdministrationDto } from '../dto/update-medication-administration.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/enums/user-role.enum';

@Controller('medication-administrations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicationAdministrationController {
  constructor(private readonly administrationService: MedicationAdministrationService) {}

  @Post()
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT)
  create(@Body() createDto: CreateMedicationAdministrationDto) {
    return this.administrationService.create(createDto);
  }

  @Get()
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  findAll(@Query('patientId') patientId?: string, @Query('prescriptionId') prescriptionId?: string) {
    const filters: any = {};
    
    if (patientId) {
      filters.patientId = patientId;
    }
    
    if (prescriptionId) {
      filters.prescriptionId = prescriptionId;
    }
    
    return this.administrationService.findAll(filters);
  }

  @Get('prescription/:prescriptionId')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  findByPrescription(@Param('prescriptionId') prescriptionId: string) {
    return this.administrationService.findByPrescription(prescriptionId);
  }

  @Get('patient/:patientId')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  findByPatient(@Param('patientId') patientId: string) {
    return this.administrationService.findByPatient(patientId);
  }

  @Get('patient/:patientId/history')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  getPatientMedicationHistory(
    @Param('patientId') patientId: string,
    @Query('days') days?: number
  ) {
    return this.administrationService.getPatientMedicationHistory(patientId, days || 30);
  }

  @Get(':id')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  findOne(@Param('id') id: string) {
    return this.administrationService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT)
  update(@Param('id') id: string, @Body() updateDto: UpdateMedicationAdministrationDto) {
    return this.administrationService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.administrationService.remove(id);
  }
}
