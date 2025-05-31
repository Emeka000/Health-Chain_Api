import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { PharmacyService } from './pharmacy.service';
import { CreateDrugDto } from './dto/create-drug.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { CheckInteractionDto } from './dto/check-interaction.dto';
import { Drug } from './entities/drug.entity';
import { Prescription } from './entities/prescription.entity';

@ApiTags('pharmacy')
@ApiBearerAuth()
@Controller('pharmacy')
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  @Post('drugs')
  @ApiOperation({ summary: 'Create a new drug entry in inventory' })
  @ApiResponse({ status: 201, type: Drug })
  createDrug(@Body() dto: CreateDrugDto) {
    return this.pharmacyService.createDrug(dto);
  }

  @Get('drugs')
  @ApiOperation({ summary: 'Get all drugs in inventory' })
  @ApiResponse({ status: 200, type: [Drug] })
  getAllDrugs() {
    return this.pharmacyService.getAllDrugs();
  }

  @Get('drugs/:id')
  @ApiOperation({ summary: 'Get a specific drug by ID' })
  @ApiResponse({ status: 200, type: Drug })
  getDrug(@Param('id', ParseIntPipe) id: number) {
    return this.pharmacyService.getDrugById(id);
  }

  @Post('prescriptions')
  @ApiOperation({ summary: 'Create a prescription and deduct inventory' })
  @ApiResponse({ status: 201, type: Prescription })
  createPrescription(@Body() dto: CreatePrescriptionDto) {
    return this.pharmacyService.createPrescription(dto);
  }

  @Get('prescriptions/:patientId')
  @ApiOperation({ summary: 'Get all prescriptions for a patient' })
  @ApiResponse({ status: 200, type: [Prescription] })
  getPrescriptions(@Param('patientId') patientId: string) {
    return this.pharmacyService.getPrescriptionsByPatient(patientId);
  }

  @Post('check-interactions')
  @ApiOperation({ summary: 'Check for drug interactions' })
  @ApiResponse({
    status: 200,
    description: 'Returns any known drug conflicts',
    schema: {
      example: {
        risky: true,
        conflicts: ['Drugs 1 & 2 have known interaction'],
      },
    },
  })
  checkInteractions(@Body() dto: CheckInteractionDto) {
    return this.pharmacyService.checkDrugInteractions(dto);
  }
}
