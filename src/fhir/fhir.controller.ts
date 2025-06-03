import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { FhirService } from './fhir.service';

@Controller('fhir')
export class FhirController {
  constructor(private readonly fhirService: FhirService) {}

  @Get('Patient/:id')
  getPatient(@Param('id') id: string) {
    return this.fhirService.getPatient(id);
  }

  @Post('Patient')
  createPatient(@Body() fhirPatient: any) {
    return this.fhirService.createPatient(fhirPatient);
  }
}
