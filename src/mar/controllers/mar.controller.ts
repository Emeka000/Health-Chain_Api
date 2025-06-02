import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MarService } from '../services/mar.service';
import {
  CreateMedicationAdministrationDto,
  VerifyBarcodeDto,
} from '../dto/medication-administration.dto';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';

@Controller('mar')
@UseGuards(JwtAuthGuard)
export class MarController {
  constructor(private readonly marService: MarService) {}

  @Get('patient/:patientId')
  async getPatientMAR(
    @Param('patientId') patientId: string,
    @Query('date') date?: string,
  ) {
    const marDate = date ? new Date(date) : new Date();
    return await this.marService.getPatientMAR(patientId, marDate);
  }

  @Post('verify-barcode')
  async verifyBarcode(@Body() verifyDto: VerifyBarcodeDto) {
    return await this.marService.verifyBarcode(verifyDto);
  }

  @Post('administration')
  async recordAdministration(
    @Body() administrationDto: CreateMedicationAdministrationDto,
  ) {
    return await this.marService.recordAdministration(administrationDto);
  }

  @Get('missed-doses')
  async getMissedDoses(@Query('date') date?: string) {
    const checkDate = date ? new Date(date) : undefined;
    return await this.marService.getMissedDoses(checkDate);
  }

  @Get('patient/:patientId/history')
  async getAdministrationHistory(
    @Param('patientId') patientId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return await this.marService.getAdministrationHistory(
      patientId,
      new Date(startDate),
      new Date(endDate),
    );
  }
}
