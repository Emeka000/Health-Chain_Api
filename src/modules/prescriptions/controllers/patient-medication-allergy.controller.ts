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
  BadRequestException,
} from '@nestjs/common';
import { PatientMedicationAllergyService } from '../services/patient-medication-allergy.service';
import { CreatePatientMedicationAllergyDto } from '../dto/create-patient-medication-allergy.dto';
import { UpdatePatientMedicationAllergyDto } from '../dto/update-patient-medication-allergy.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/enums/user-role.enum';

@Controller('patient-medication-allergies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientMedicationAllergyController {
  constructor(private readonly allergyService: PatientMedicationAllergyService) {}

  @Post()
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  create(@Body() createDto: CreatePatientMedicationAllergyDto) {
    return this.allergyService.create(createDto);
  }

  @Get()
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  findAll(@Query('patientId') patientId?: string, @Query('status') status?: string) {
    const filters: any = {};
    
    if (patientId) {
      filters.patientId = patientId;
    }
    
    if (status) {
      filters.status = status;
    }
    
    return this.allergyService.findAll(filters);
  }

  @Get('patient/:patientId')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  findByPatient(@Param('patientId') patientId: string) {
    return this.allergyService.findByPatient(patientId);
  }

  @Get('patient/:patientId/active')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  findActiveByPatient(@Param('patientId') patientId: string) {
    return this.allergyService.findActiveByPatient(patientId);
  }

  @Get('check')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  checkMedicationAllergy(
    @Query('patientId') patientId: string,
    @Query('medicationName') medicationName: string,
  ) {
    if (!patientId || !medicationName) {
      throw new BadRequestException('Patient ID and medication name are required');
    }
    
    return this.allergyService.checkMedicationAllergy(patientId, medicationName);
  }

  @Get(':id')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  findOne(@Param('id') id: string) {
    return this.allergyService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  update(@Param('id') id: string, @Body() updateDto: UpdatePatientMedicationAllergyDto) {
    return this.allergyService.update(id, updateDto);
  }

  @Patch(':id/inactivate')
  @Roles(UserRole.DOCTOR, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  inactivate(@Param('id') id: string, @Body('updatedBy') updatedBy: string) {
    if (!updatedBy) {
      throw new BadRequestException('Updated by ID is required');
    }
    return this.allergyService.inactivate(id, updatedBy);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.allergyService.remove(id);
  }
}
