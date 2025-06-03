export class CreateObservationDto {
  @ApiProperty({
    description: 'Patient UUID reference for this observation',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    format: 'uuid',
    required: true,
  })
  @IsUUID()
  patientId: string;

  @ApiProperty({
    description: 'LOINC code for the observation type',
    example: '29463-7',
    pattern: '^[0-9]+-[0-9]+$',
    required: true,
  })
  @IsString()
  @Matches(/^[0-9]+-[0-9]+$/)
  loincCode: string;

  @ApiProperty({
    description: 'Human-readable name of the observation',
    example: 'Body Weight',
    required: true,
  })
  @IsString()
  observationName: string;

  @ApiProperty({
    description: 'Measured value of the observation',
    example: '70.5',
    type: String,
    required: true,
  })
  @IsString()
  value: string;

  @ApiProperty({
    description: 'Unit of measurement (UCUM preferred)',
    example: 'kg',
    required: true,
  })
  @IsString()
  unit: string;

  @ApiProperty({
    description: 'Date and time when observation was made',
    example: '2024-06-01T10:30:00.000Z',
    type: String,
    format: 'date-time',
    required: true,
  })
  @IsDateString()
  observationDateTime: string;
}
