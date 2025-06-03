@ApiTags('Appointments')
@ApiBearerAuth('medical-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('appointments')
export class AppointmentsController {
  @Post()
  @Roles('doctor', 'nurse', 'admin', 'receptionist')
  @ApiOperation({
    summary: 'Schedule new appointment',
    description: `
      Creates a new appointment in the medical scheduling system.
      
      **FHIR R4 Compliance**: Follows FHIR Appointment Resource specification
      **Business Rules**:
      - Appointments must be scheduled at least 1 hour in advance
      - No double-booking validation applied
      - Automatic confirmation for established patients
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Appointment scheduled successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440002',
        patientId: '550e8400-e29b-41d4-a716-446655440000',
        providerId: '550e8400-e29b-41d4-a716-446655440001',
        startDateTime: '2024-06-15T14:30:00.000Z',
        endDateTime: '2024-06-15T15:30:00.000Z',
        status: 'booked',
        confirmationNumber: 'CONF-2024-567890',
      },
    },
  })
  async createAppointment(@Body() createAppointmentDto: CreateAppointmentDto) {
    return {
      message: 'Appointment creation endpoint - Implementation required',
      appointmentData: createAppointmentDto,
    };
  }
}
