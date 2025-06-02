import { Controller, Post, Body, Headers, Ip, UseFilters, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateMedicalDataDto } from './medical-data.dto';
import { MedicalDataService } from './medical-data.service';
import { MedicalExceptionFilter } from './medical-exception.filter';

@ApiTags('medical-data')
@Controller('medical-data')
@UseFilters(MedicalExceptionFilter)
export class MedicalDataController {
  private readonly logger = new Logger(MedicalDataController.name);

  constructor(private readonly medicalDataService: MedicalDataService) {}

  @Post()
  @ApiOperation({ summary: 'Create medical record with comprehensive validation' })
  @ApiResponse({ 
    status: 201, 
    description: 'Medical record created successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        status: { type: 'string' },
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation failed - medical codes or data format invalid' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Medical emergency or system error' 
  })
  async createMedicalRecord(
    @Body() createMedicalDataDto: CreateMedicalDataDto,
    @Headers('user-id') userId: string = 'anonymous',
    @Ip() ipAddress: string
  ) {
    this.logger.log(`Creating medical record for patient: ${createMedicalDataDto.patientId}`);
    
    return await this.medicalDataService.createMedicalRecord(
      createMedicalDataDto,
      userId,
      ipAddress
    );
  }
}
