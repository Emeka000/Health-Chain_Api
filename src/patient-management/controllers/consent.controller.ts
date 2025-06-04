import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ConsentService } from '../services/consent.service';

@Controller('api/patients/:patientId/consents')
@UseGuards(JwtAuthGuard)
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Post()
  async grantConsent(
    @Param('patientId') patientId: string,
    @Body() body: { consentType: string; description: string },
    @Request() req,
  ) {
    return await this.consentService.grantConsent(
      patientId,
      body.consentType,
      body.description,
      req.ip,
    );
  }

  @Patch(':consentType/revoke')
  async revokeConsent(
    @Param('patientId') patientId: string,
    @Param('consentType') consentType: string,
  ) {
    return await this.consentService.revokeConsent(patientId, consentType);
  }

  @Get()
  async findByPatient(@Param('patientId') patientId: string) {
    return await this.consentService.findByPatient(patientId);
  }

  @Get(':consentType/check')
  async checkConsent(
    @Param('patientId') patientId: string,
    @Param('consentType') consentType: string,
  ) {
    const hasConsent = await this.consentService.checkConsent(
      patientId,
      consentType,
    );
    return { hasConsent };
  }
}
