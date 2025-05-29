import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateInsuranceClaimDto } from './dto/create-insurance-claim.dto';
import { GenerateFinancialReportDto } from './dto/generate-financial-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { ClaimStatus } from './enums/claim-status.enum';
import { ReportType } from './enums/report-type.enum';
import { ReportPeriod } from './enums/report-period.enum';

@Controller('billing')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // Invoice Management Endpoints
  @Post('invoices')
  @Roles('admin', 'billing')
  async createInvoice(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.billingService.createInvoice(createInvoiceDto);
  }

  @Get('invoices/:id')
  @Roles('admin', 'billing', 'doctor')
  async getInvoice(@Param('id', ParseUUIDPipe) id: string) {
    return this.billingService.getInvoice(id);
  }

  // Payment Processing Endpoints
  @Post('payments')
  @Roles('admin', 'billing')
  async createPayment(@Body() createPaymentDto: CreatePaymentDto) {
    return this.billingService.createPayment(createPaymentDto);
  }

  @Put('payments/:id/process')
  @Roles('admin', 'billing')
  async processPayment(@Param('id', ParseUUIDPipe) id: string) {
    return this.billingService.processPayment(id);
  }

  // Insurance Claim Endpoints
  @Post('insurance-claims')
  @Roles('admin', 'billing')
  async createInsuranceClaim(@Body() createClaimDto: CreateInsuranceClaimDto) {
    return this.billingService.createInsuranceClaim(createClaimDto);
  }

  @Put('insurance-claims/:id/process')
  @Roles('admin', 'billing')
  async processInsuranceClaim(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ClaimStatus,
    @Body('approvedAmount') approvedAmount?: number,
  ) {
    return this.billingService.processInsuranceClaim(
      id,
      status,
      approvedAmount,
    );
  }

  // Financial Reporting Endpoints
  @Post('reports')
  @Roles('admin', 'billing')
  async generateFinancialReport(@Body() reportDto: GenerateFinancialReportDto) {
    return this.billingService.generateFinancialReport(reportDto);
  }

  // Analytics Endpoints
  @Get('analytics/revenue')
  @Roles('admin', 'billing')
  async getRevenueAnalytics(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    const reportDto: GenerateFinancialReportDto = {
      reportType: ReportType.REVENUE,
      period: ReportPeriod.CUSTOM,
      startDate,
      endDate,
    };
    return this.billingService.generateFinancialReport(reportDto);
  }

  @Get('analytics/insurance')
  @Roles('admin', 'billing')
  async getInsuranceAnalytics(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    const reportDto: GenerateFinancialReportDto = {
      reportType: ReportType.INSURANCE_CLAIMS,
      period: ReportPeriod.CUSTOM,
      startDate,
      endDate,
    };
    return this.billingService.generateFinancialReport(reportDto);
  }

  @Get('analytics/department-performance')
  @Roles('admin', 'billing')
  async getDepartmentPerformance(
    @Query('startDate') startDate: Date,
    @Query('endDate') endDate: Date,
  ) {
    const reportDto: GenerateFinancialReportDto = {
      reportType: ReportType.DEPARTMENT_PERFORMANCE,
      period: ReportPeriod.CUSTOM,
      startDate,
      endDate,
    };
    return this.billingService.generateFinancialReport(reportDto);
  }
}
