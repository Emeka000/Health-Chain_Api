import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  ParseIntPipe,
  Logger,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { Request } from 'express';
import { ComplianceService } from '../services/compliance.service';
import { HipaaService } from '../services/hipaa.service';
import { CreateRegulationDto } from '../dto/create-regulation.dto';
import { CreateComplianceRequirementDto } from '../dto/create-compliance-requirement.dto';
import { CreateComplianceAssessmentDto } from '../dto/create-compliance-assessment.dto';
import { CreateAuditLogDto } from '../dto/audit-log.dto';
import { ComplianceDashboardDto } from '../dto/compliance-dashboard.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RegulationType } from '../entities/regulation.entity';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    roles: string[];
    email: string;
  };
}

@ApiTags('Compliance Management')
@Controller('compliance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComplianceController {
  private readonly logger = new Logger(ComplianceController.name);

  constructor(
    private readonly complianceService: ComplianceService,
    private readonly hipaaService: HipaaService,
  ) {}

  @Get('dashboard')
  @Roles('admin', 'compliance_officer', 'manager')
  @ApiOperation({ summary: 'Get compliance dashboard metrics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard metrics retrieved successfully',
    type: ComplianceDashboardDto,
  })
  async getDashboard(): Promise<ComplianceDashboardDto> {
    this.logger.log('Getting compliance dashboard');

    const [compliance, hipaa] = await Promise.all([
      this.complianceService.getComplianceMetrics(),
      this.hipaaService.getHipaaMetrics(),
    ]);

    return {
      compliance,
      training: {
        completionRate: 0,
        currentlyTrained: 0,
        expiredTraining: 0,
        overdueTraining: 0,
        averageCompetencyScore: 0,
      }, // Will be implemented by TrainingService
      hipaa,
      lastUpdated: new Date(),
    };
  }

  @Post('regulations')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Create a new regulation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Regulation created successfully',
  })
  async createRegulation(
    @Body() createRegulationDto: CreateRegulationDto,
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.log(`Creating regulation: ${createRegulationDto.code}`);
    return this.complianceService.createRegulation(
      createRegulationDto,
      req.user.id,
    );
  }

  @Post('requirements')
  @Roles('admin', 'compliance_officer')
  @ApiOperation({ summary: 'Create a compliance requirement' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Compliance requirement created successfully',
  })
  async createRequirement(
    @Body() createRequirementDto: CreateComplianceRequirementDto,
    @Req() req: AuthenticatedRequest,
  ) {
    this.logger.log(`Creating requirement: ${createRequirementDto.code}`);
    return this.complianceService.createComplianceRequirement(
      createRequirementDto,
      req.user.id,
    );
  }

  @Post('assessments')
  @Roles('admin', 'compliance_officer', 'auditor')
  @ApiOperation({ summary: 'Create a compliance assessment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Compliance assessment created successfully',
  })
  async createAssessment(
    @Body() createAssessmentDto: CreateComplianceAssessmentDto,
  ) {
    this.logger.log(
      `Creating assessment for requirement: ${createAssessmentDto.requirementId}`,
    );
    return this.complianceService.createComplianceAssessment(
      createAssessmentDto,
    );
  }

  @Get('regulations/:type/compliance')
  @Roles('admin', 'compliance_officer', 'manager')
  @ApiOperation({ summary: 'Get compliance status for a regulation type' })
  @ApiParam({ name: 'type', enum: RegulationType })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Regulation compliance status retrieved successfully',
  })
  async getRegulationCompliance(@Param('type') type: RegulationType) {
    this.logger.log(`Getting compliance for regulation type: ${type}`);
    return this.complianceService.getRegulationCompliance(type);
  }

  @Get('assessments/overdue')
  @Roles('admin', 'compliance_officer', 'manager')
  @ApiOperation({ summary: 'Get overdue compliance assessments' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Overdue assessments retrieved successfully',
  })
  async getOverdueAssessments() {
    this.logger.log('Getting overdue assessments');
    return this.complianceService.getOverdueAssessments();
  }

  @Get('findings/high-risk')
  @Roles('admin', 'compliance_officer', 'manager')
  @ApiOperation({ summary: 'Get high-risk compliance findings' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'High-risk findings retrieved successfully',
  })
  async getHighRiskFindings() {
    this.logger.log('Getting high-risk findings');
    return this.complianceService.getHighRiskFindings();
  }

  @Post('audit/phi-access')
  @Roles('system', 'admin') // Typically called by system
  @ApiOperation({ summary: 'Log PHI access for HIPAA compliance' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'PHI access logged successfully',
  })
  async logPhiAccess(@Body() auditLogDto: CreateAuditLogDto) {
    return this.hipaaService.logPhiAccess(auditLogDto);
  }

  @Get('audit/suspicious-activities')
  @Roles('admin', 'compliance_officer', 'security_officer')
  @ApiOperation({ summary: 'Get suspicious HIPAA activities' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 50 })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Suspicious activities retrieved successfully',
  })
  async getSuspiciousActivities(
    @Query('limit', ParseIntPipe) limit: number = 50,
  ) {
    this.logger.log('Getting suspicious activities');
    return this.hipaaService.getSuspiciousActivities(limit);
  }

  @Get('reports/phi-access')
  @Roles('admin', 'compliance_officer', 'privacy_officer')
  @ApiOperation({ summary: 'Generate PHI access report' })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
    example: '2024-01-31',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'PHI access report generated successfully',
  })
  async getPhiAccessReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    this.logger.log(`Generating PHI access report: ${startDate} to ${endDate}`);
    return this.hipaaService.getPhiAccessReport(
      new Date(startDate),
      new Date(endDate),
    );
  }
}
