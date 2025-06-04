import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
  Delete,
  UploadedFile,
  UseInterceptors,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';
import { PatientsService } from './patients.service';
import { PatientDocumentService } from './services/patient-document.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientSearchDto } from './dto/patient-search.dto';
import { AdmitPatientDto } from './dto/admit-patient.dto';
import { DischargePatientDto } from './dto/discharge-patient.dto';
import { TransferPatientDto } from './dto/transfer-patient.dto';
import { PatientDocumentDto, VerifyPatientIdentityDto } from './dto/patient-document.dto';
import { MergePatientDto } from './dto/merge-patient.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('patients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('patients')
export class PatientsController {
  constructor(
    private readonly patientsService: PatientsService,
    private readonly patientDocumentService: PatientDocumentService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new patient' })
  @ApiResponse({ status: 201, description: 'Patient created successfully' })
  @ApiResponse({ status: 409, description: 'Potential duplicate patient detected' })
  create(@Body() createPatientDto: CreatePatientDto, @Req() req: any) {
    // Extract user role from JWT token
    const userRole = req.user?.role;
    return this.patientsService.create(createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all patients with optional search filters' })
  @ApiResponse({ status: 200, description: 'List of patients' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  findAll(@Query() searchParams: PatientSearchDto, @Req() req: any) {
    // Extract user role from JWT token
    const userRole = req.user?.role;
    return this.patientsService.findAll(searchParams, userRole);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient by ID' })
  @ApiResponse({ status: 200, description: 'Patient details' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  findOne(@Param('id') id: string, @Req() req: any) {
    // Extract user role from JWT token
    const userRole = req.user?.role;
    return this.patientsService.findOne(id, userRole);
  }
  
  @Get('mrn/:mrn')
  @ApiOperation({ summary: 'Get patient by Medical Record Number' })
  @ApiResponse({ status: 200, description: 'Patient details' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  findByMRN(@Param('mrn') mrn: string, @Req() req: any) {
    // Extract user role from JWT token
    const userRole = req.user?.role;
    return this.patientsService.findByMRN(mrn, userRole);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update patient' })
  @ApiResponse({ status: 200, description: 'Patient updated successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  update(
    @Param('id') id: string, 
    @Body() updatePatientDto: UpdatePatientDto,
    @Req() req: any
  ) {
    // Extract user role from JWT token
    const userRole = req.user?.role;
    return this.patientsService.update(id, updatePatientDto, userRole);
  }
  
  @Post('admit')
  @ApiOperation({ summary: 'Admit a patient' })
  @ApiResponse({ status: 200, description: 'Patient admitted successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  admitPatient(@Body() admitPatientDto: AdmitPatientDto, @Req() req: any) {
    // Extract user role from JWT token
    const userRole = req.user?.role;
    return this.patientsService.admitPatient(admitPatientDto, userRole);
  }
  
  @Post('discharge')
  @ApiOperation({ summary: 'Discharge a patient' })
  @ApiResponse({ status: 200, description: 'Patient discharged successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  dischargePatient(@Body() dischargePatientDto: DischargePatientDto, @Req() req: any) {
    // Extract user role from JWT token
    const userRole = req.user?.role;
    return this.patientsService.dischargePatient(dischargePatientDto, userRole);
  }
  
  @Post('transfer')
  @ApiOperation({ summary: 'Transfer a patient to a new room/bed' })
  @ApiResponse({ status: 200, description: 'Patient transferred successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  transferPatient(@Body() transferPatientDto: TransferPatientDto, @Req() req: any) {
    // Extract user role from JWT token
    const userRole = req.user?.role;
    return this.patientsService.transferPatient(transferPatientDto, userRole);
  }
  
  @Get(':id/duplicates')
  @ApiOperation({ summary: 'Find potential duplicate patients' })
  @ApiResponse({ status: 200, description: 'List of potential duplicate patients' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  findDuplicates(@Param('id') id: string, @Req() req: any) {
    // Extract user role from JWT token
    const userRole = req.user?.role;
    return this.patientsService.findDuplicates(id, userRole);
  }
  
  @Post('merge')
  @ApiOperation({ summary: 'Merge two patient records' })
  @ApiResponse({ status: 200, description: 'Patients merged successfully' })
  @ApiResponse({ status: 404, description: 'One or both patients not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  mergePatients(@Body() mergePatientDto: MergePatientDto, @Req() req: any) {
    // Extract user role from JWT token
    const userRole = req.user?.role;
    return this.patientsService.mergePatients(mergePatientDto, userRole);
  }
  
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a patient record' })
  @ApiResponse({ status: 200, description: 'Patient deleted successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  remove(@Param('id') id: string, @Req() req: any) {
    // Extract user role from JWT token
    const userRole = req.user?.role;
    return this.patientsService.remove(id, userRole);
  }
  
  @Post(':id/photo')
  @ApiOperation({ summary: 'Upload patient photo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Photo uploaded successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @UseInterceptors(FileInterceptor('file'))
  uploadPhoto(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Req() req: any
  ) {
    // Extract user role from JWT token
    const userRole = req.user?.role;
    const documentDto: PatientDocumentDto = {
      patientId: id,
      documentType: 'photo',
    };
    return this.patientDocumentService.uploadPatientPhoto(documentDto, file);
  }
  
  @Post(':id/identification')
  @ApiOperation({ summary: 'Upload patient identification document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        description: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Identification document uploaded successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @UseInterceptors(FileInterceptor('file'))
  uploadIdentification(
    @Param('id') id: string,
    @UploadedFile() file: any,
    @Body('description') description: string,
    @Req() req: any
  ) {
    // Extract user role from JWT token
    const userRole = req.user?.role;
    const documentDto: PatientDocumentDto = {
      patientId: id,
      documentType: 'identification',
      description,
    };
    // Use uploadDocument method instead of uploadPatientIdentification
    return this.patientDocumentService.uploadDocument(documentDto, file);
  }
  
  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify patient identity' })
  @ApiResponse({ status: 200, description: 'Patient identity verified successfully' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  verifyIdentity(
    @Param('id') id: string,
    @Body() verifyPatientIdentityDto: VerifyPatientIdentityDto,
    @Req() req: any
  ) {
    // Extract user role from JWT token
    const userRole = req.user?.role;
    
    // Check permissions
    if (!['ADMIN', 'DOCTOR', 'NURSE'].includes(userRole)) {
      throw new ForbiddenException('Insufficient permissions to verify patient identity');
    }
    
    // Pass the patient ID and verification DTO
    return this.patientDocumentService.verifyPatientIdentity(id, verifyPatientIdentityDto);
  }
}
