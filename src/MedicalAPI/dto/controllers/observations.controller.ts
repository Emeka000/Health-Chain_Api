@ApiTags('Observations')
@ApiBearerAuth('medical-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('observations')
export class ObservationsController {
  
  @Post()
  @Roles('doctor', 'nurse', 'lab-tech')
  @ApiOperation({
    summary: 'Record new clinical observation',
    description: `
      Records a new clinical observation for a patient.
      
      **FHIR R4 Compatibility**: Follows US Core Laboratory Result Observation Profile
      **Standards Compliance**:
      - LOINC codes required for observation types
      - UCUM units preferred for measurements
      - ISO 8601 timestamps for all observations
      
      **Clinical Data Quality**:
      - Automated range validation for common vital signs
      - Critical value alerts for abnormal results
      - Integration with clinical decision support systems
    `
  })
  @ApiResponse({
    status: 201,
    description: 'Observation recorded successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440003',
        patientId: '550e8400-e29b-41d4-a716-446655440000',
        loincCode: '29463-7',
        observationName: 'Body Weight',
        value: '70.5',
        unit: 'kg',
        observationDateTime: '2024-06-01T10:30:00.000Z',
        status: 'final',
        recordedBy: 'Dr. Smith'
      }
    }
  })
  async createObservation(@Body() createObservationDto: CreateObservationDto) {
    return {
      message: 'Observation creation endpoint - Implementation required',
      observationData: createObservationDto
    };
  }
}