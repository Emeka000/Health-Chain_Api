import { Controller, Get, Post, Body, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiParam, ApiSecurity } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreatePatientDto } from '../dto/patient.dto';

@ApiTags('Patients')
@ApiBearerAuth('medical-auth')
@ApiSecurity('medical-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('patients')
export class PatientsController {
  
  @Post()
  @Roles('doctor', 'nurse', 'admin')
  @ApiOperation({
    summary: 'Create new patient record',
    description: `
      Creates a new patient record in the medical system.
      
      **HIPAA Compliance Notice**: This endpoint creates Protected Health Information (PHI).
      - Requires appropriate medical staff role authorization
      - All patient data is encrypted at rest and in transit
      - Access is logged for audit purposes
      - Minimum necessary principle applies
      
      **FHIR R4 Compatibility**: Patient resource follows US Core Patient Profile
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Patient record created successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1980-01-01',
        gender: 'male',
        medicalRecordNumber: 'MRN-2024-001234',
        createdAt: '2024-06-01T10:00:00.000Z',
        updatedAt: '2024-06-01T10:00:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid patient data provided',
    schema: {
      example: {
        statusCode: 400,
        message: ['firstName must be longer than 1 character'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing authentication token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient role permissions for PHI access'
  })
  async createPatient(@Body() createPatientDto: CreatePatientDto) {
    // Implementation would go here
    return {
      message: 'Patient creation endpoint - Implementation required',
      receivedData: createPatientDto
    };
  }

  @Get(':id')
  @Roles('doctor', 'nurse', 'admin', 'receptionist')
  @ApiOperation({
    summary: 'Get patient by ID',
    description: `
      Retrieves patient information by UUID.
      
      **HIPAA Compliance**: 
      - Returns only necessary patient information based on user role
      - Access logged for audit trail
      - PHI exposure minimized per role-based access control
      
      **Data Minimization**: Different roles receive different data subsets:
      - Doctor: Full medical record access
      - Nurse: Clinical data access
      - Receptionist: Limited demographic data only
    `
  })
  @ApiParam({
    name: 'id',
    description: 'Patient UUID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    format: 'uuid'
  })
  @ApiResponse({
    status: 200,
    description: 'Patient information retrieved successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        firstName: 'John',
        lastName: 'Doe',
        age: 44, // Calculated from DOB, DOB not exposed
        gender: 'male',
        medicalRecordNumber: 'MRN-2024-001234',
        lastVisit: '2024-05-15T14:30:00.000Z'
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Patient not found'
  })
  async getPatient(@Param('id', ParseUUIDPipe) id: string) {
    return {
      message: 'Patient retrieval endpoint - Implementation required',
      patientId: id
    };
  }
}
