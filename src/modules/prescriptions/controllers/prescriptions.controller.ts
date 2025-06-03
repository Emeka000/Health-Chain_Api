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
  BadRequestException
} from '@nestjs/common';
import { PrescriptionsService } from '../services/prescriptions.service';
import { CreatePrescriptionDto } from '../dto/create-prescription.dto';
import { UpdatePrescriptionDto } from '../dto/update-prescription.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/enums/user-role.enum';

@Controller('prescriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @Roles(UserRole.DOCTOR, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT)
  create(@Body() createPrescriptionDto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(createPrescriptionDto);
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
    
    return this.prescriptionsService.findAll(filters);
  }

  @Get('patient/:patientId')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  findByPatient(@Param('patientId') patientId: string) {
    return this.prescriptionsService.findByPatient(patientId);
  }

  @Get('patient/:patientId/active')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  findActiveByPatient(@Param('patientId') patientId: string) {
    return this.prescriptionsService.findActiveByPatient(patientId);
  }

  @Get(':id')
  @Roles(UserRole.DOCTOR, UserRole.NURSE, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  findOne(@Param('id') id: string) {
    return this.prescriptionsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.DOCTOR, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT)
  update(@Param('id') id: string, @Body() updatePrescriptionDto: UpdatePrescriptionDto) {
    return this.prescriptionsService.update(id, updatePrescriptionDto);
  }

  @Patch(':id/approve')
  @Roles(UserRole.PHARMACIST)
  approve(@Param('id') id: string, @Body('pharmacistId') pharmacistId: string) {
    if (!pharmacistId) {
      throw new BadRequestException('Pharmacist ID is required');
    }
    return this.prescriptionsService.approve(id, pharmacistId);
  }

  @Patch(':id/cancel')
  @Roles(UserRole.DOCTOR, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  cancel(
    @Param('id') id: string, 
    @Body('reason') reason: string,
    @Body('updatedBy') updatedBy: string
  ) {
    if (!reason) {
      throw new BadRequestException('Cancellation reason is required');
    }
    if (!updatedBy) {
      throw new BadRequestException('Updated by ID is required');
    }
    return this.prescriptionsService.cancel(id, reason, updatedBy);
  }

  @Patch(':id/refill')
  @Roles(UserRole.DOCTOR, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  refill(@Param('id') id: string, @Body('updatedBy') updatedBy: string) {
    if (!updatedBy) {
      throw new BadRequestException('Updated by ID is required');
    }
    return this.prescriptionsService.refill(id, updatedBy);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.prescriptionsService.remove(id);
  }
}
