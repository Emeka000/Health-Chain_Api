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
import { DrugInteractionService } from '../services/drug-interaction.service';
import { CreateDrugInteractionAlertDto } from '../dto/create-drug-interaction-alert.dto';
import { UpdateDrugInteractionAlertDto } from '../dto/update-drug-interaction-alert.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { UserRole } from '../../../auth/enums/user-role.enum';

@Controller('drug-interaction-alerts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DrugInteractionAlertController {
  constructor(private readonly drugInteractionService: DrugInteractionService) {}

  @Post('check')
  @Roles(UserRole.DOCTOR, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  checkInteractions(
    @Body('patientId') patientId: string,
    @Body('medicationName') medicationName: string,
    @Body('medicationId') medicationId?: string,
  ) {
    if (!patientId || !medicationName) {
      throw new BadRequestException('Patient ID and medication name are required');
    }
    
    return this.drugInteractionService.checkInteractions(patientId, medicationName, medicationId);
  }

  @Patch(':id/override')
  @Roles(UserRole.DOCTOR, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  override(
    @Param('id') id: string,
    @Body('overriddenBy') overriddenBy: string,
    @Body('overrideReason') overrideReason: string,
  ) {
    if (!overriddenBy || !overrideReason) {
      throw new BadRequestException('Override user ID and reason are required');
    }
    
    return this.drugInteractionService.overrideAlert(id, overriddenBy, overrideReason);
  }

  @Patch(':id/acknowledge')
  @Roles(UserRole.DOCTOR, UserRole.NURSE_PRACTITIONER, UserRole.PHYSICIAN_ASSISTANT, UserRole.PHARMACIST)
  acknowledge(
    @Param('id') id: string,
    @Body('acknowledgedBy') acknowledgedBy: string,
  ) {
    if (!acknowledgedBy) {
      throw new BadRequestException('Acknowledging user ID is required');
    }
    
    return this.drugInteractionService.acknowledgeAlert(id, acknowledgedBy);
  }
}
