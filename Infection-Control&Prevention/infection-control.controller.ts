import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Body, 
    Param, 
    Query,
    ParseUUIDPipe 
  } from '@nestjs/common';
  import { InfectionControlService } from './infection-control.service';
  import { 
    Infection, 
    IsolationPrecaution, 
    AntibioticUsage, 
    Policy, 
    Outbreak, 
    HandHygieneCompliance 
  } from './entities';
  
  @Controller('infection-control')
  export class InfectionControlController {
    constructor(private readonly infectionControlService: InfectionControlService) {}
  
    // Dashboard
    @Get('dashboard')
    async getDashboard() {
      return await this.infectionControlService.getDashboardSummary();
    }
  
    // Infection Surveillance
    @Post('infections')
    async createInfection(@Body() infectionData: Partial<Infection>) {
      return await this.infectionControlService.createInfection(infectionData);
    }
  
    @Get('infections/trends')
    async getInfectionTrends() {
      return await this.infectionControlService.getInfectionTrends();
    }
  
    @Get('infections/hai-rates')
    async getHAIRates() {
      return await this.infectionControlService.getHAIRates();
    }
  
    @Get('infections')
    async getInfections(
      @Query('startDate') startDate: string,
      @Query('endDate') endDate: string
    ) {
      return await this.infectionControlService.getInfectionsByDateRange(
        new Date(startDate),
        new Date(endDate)
      );
    }
  
    // Isolation Precautions
    @Post('isolation-precautions')
    async createIsolationPrecaution(@Body() precautionData: Partial<IsolationPrecaution>) {
      return await this.infectionControlService.createIsolationPrecaution(precautionData);
    }
  
    @Get('isolation-precautions/active')
    async getActivePrecautions() {
      return await this.infectionControlService.getActivePrecautions();
    }
  
    @Put('isolation-precautions/:id/discontinue')
    async discontinuePrecaution(
      @Param('id', ParseUUIDPipe) id: string,
      @Body('endDate') endDate: string
    ) {
      return await this.infectionControlService.discontinuePrecaution(id, new Date(endDate));
    }
  
    // Antibiotic Stewardship
    @Post('antibiotic-usage')
    async createAntibioticUsage(@Body() usageData: Partial<AntibioticUsage>) {
      return await this.infectionControlService.createAntibioticUsage(usageData);
    }
  
    @Get('antibiotic-usage/resistance-patterns')
    async getResistancePatterns() {
      return await this.infectionControlService.getAntibioticResistancePattern();
    }
  
    @Get('antibiotic-usage/reports')
    async getAntibioticUsageReport() {
      return await this.infectionControlService.getAntibioticUsageReport();
    }
  
    @Put('antibiotic-usage/:id/flag-review')
    async flagForReview(@Param('id', ParseUUIDPipe) id: string) {
      return await this.infectionControlService.flagForStewardshipReview(id);
    }
  
    // Policies
    @Post('policies')
    async createPolicy(@Body() policyData: Partial<Policy>) {
      return await this.infectionControlService.createPolicy(policyData);
    }
  
    @Get('policies')
    async getActivePolicies() {
      return await this.infectionControlService.getActivePolicies();
    }
  
    @Put('policies/:id')
    async updatePolicy(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() updateData: Partial<Policy>
    ) {
      return await this.infectionControlService.updatePolicy(id, updateData);
    }
  
    // Outbreaks
    @Post('outbreaks')
    async createOutbreak(@Body() outbreakData: Partial<Outbreak>) {
      return await this.infectionControlService.createOutbreak(outbreakData);
    }
  
    @Get('outbreaks/active')
    async getActiveOutbreaks() {
      return await this.infectionControlService.getActiveOutbreaks();
    }
  
    @Put('outbreaks/:id/update-cases')
    async updateOutbreakCases(
      @Param('id', ParseUUIDPipe) id: string,
      @Body() caseData: { confirmedCases: number; suspectedCases: number }
    ) {
      return await this.infectionControlService.updateOutbreakCaseCount(
        id, 
        caseData.confirmedCases, 
        caseData.suspectedCases
      );
    }
  
    @Put('outbreaks/:id/close')
    async closeOutbreak(
      @Param('id', ParseUUIDPipe) id: string,
      @Body('endDate') endDate: string
    ) {
      return await this.infectionControlService.closeOutbreak(id, new Date(endDate));
    }
  
    // Hand Hygiene Compliance
    @Post('hand-hygiene-compliance')
    async recordHandHygieneCompliance(@Body() complianceData: Partial<HandHygieneCompliance>) {
      return await this.infectionControlService.recordHandHygieneCompliance(complianceData);
    }
  
    @Get('hand-hygiene-compliance/reports')
    async getHandHygieneReport(@Query('department') department?: string) {
      return await this.infectionControlService.getHandHygieneComplianceReport(department);
    }
  }
  
  // DTOs for validation (create separate DTO files as needed)
  export class CreateInfectionDto {
    patientId: string;
    type: string;
    pathogen: string;
    onsetDate: Date;
    sourceLocation?: string;
    riskFactors?: string;
    clinicalNotes?: string;
  }
  
  export class CreateIsolationPrecautionDto {
    patientId: string;
    type: string;
    reason: string;
    startDate: Date;
    specialInstructions?: string;
    orderedBy: string;
  }
  
  export class CreateAntibioticUsageDto {
    patientId: string;
    antibiotic: string;
    dosage: string;
    frequency: string;
    startDate: Date;
    indication: string;
    prescribedBy: string;
  }
  
  export class CreateOutbreakDto {
    name: string;
    pathogen: string;
    affectedUnit: string;
    startDate: Date;
    investigationLead: string;
  }
  
  export class RecordHandHygieneComplianceDto {
    staffId: string;
    department: string;
    observationDate: Date;
    opportunitiesObserved: number;
    opportunitiesComplied: number;
    observedBy: string;
    notes?: string;
  }
  
  