export enum AppointmentStatus {
    PROPOSED = 'proposed',
    PENDING = 'pending',
    BOOKED = 'booked',
    ARRIVED = 'arrived',
    FULFILLED = 'fulfilled',
    CANCELLED = 'cancelled',
    NOSHOW = 'noshow'
  }
  
  export class CreateAppointmentDto {
    @ApiProperty({
      description: 'Patient UUID reference (FHIR R4 Reference)',
      example: '550e8400-e29b-41d4-a716-446655440000',
      type: String,
      format: 'uuid',
      required: true
    })
    @IsUUID()
    patientId: string;
  
    @ApiProperty({
      description: 'Healthcare provider UUID reference',
      example: '550e8400-e29b-41d4-a716-446655440001',
      type: String,
      format: 'uuid',
      required: true
    })
    @IsUUID()
    providerId: string;
  
    @ApiProperty({
      description: 'Appointment start date and time (ISO 8601 format)',
      example: '2024-06-15T14:30:00.000Z',
      type: String,
      format: 'date-time',
      required: true
    })
    @IsDateString()
    startDateTime: string;
  
    @ApiProperty({
      description: 'Appointment end date and time (ISO 8601 format)',
      example: '2024-06-15T15:30:00.000Z',
      type: String,
      format: 'date-time',
      required: true
    })
    @IsDateString()
    endDateTime: string;
  
    @ApiProperty({
      description: 'Appointment status following FHIR R4 AppointmentStatus ValueSet',
      enum: AppointmentStatus,
      example: AppointmentStatus.BOOKED,
      required: true
    })
    @IsEnum(AppointmentStatus)
    status: AppointmentStatus;
  
    @ApiPropertyOptional({
      description: 'Reason for appointment (Medical terminology preferred)',
      example: 'Annual Physical Examination',
      maxLength: 200
    })
    @IsOptional()
    @IsString()
    @Length(0, 200)
    reasonForVisit?: string;
  }
  