import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { Payment } from './entities/payment.entity';
import { InsuranceClaim } from './entities/insurance-claim.entity';
import { FinancialReport } from './entities/financial-report.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateInsuranceClaimDto } from './dto/create-insurance-claim.dto';
import { GenerateFinancialReportDto } from './dto/generate-financial-report.dto';
import { InvoiceStatus } from './enums/invoice-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { ClaimStatus } from './enums/claim-status.enum';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(InsuranceClaim)
    private insuranceClaimRepository: Repository<InsuranceClaim>,
    @InjectRepository(FinancialReport)
    private financialReportRepository: Repository<FinancialReport>,
  ) {}

  // Invoice Management
  async createInvoice(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const invoice = this.invoiceRepository.create({
      ...createInvoiceDto,
      amount: createInvoiceDto.items.reduce(
        (total, item) => total + item.quantity * item.unitPrice,
        0,
      ),
      status: InvoiceStatus.PENDING,
      paidAmount: 0,
    });
    return this.invoiceRepository.save(invoice);
  }

  async getInvoice(id: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOne({
      where: { id },
      relations: ['payments'],
    });
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async updateInvoiceStatus(
    id: string,
    status: InvoiceStatus,
  ): Promise<Invoice> {
    const invoice = await this.getInvoice(id);
    invoice.status = status;
    return this.invoiceRepository.save(invoice);
  }

  // Payment Processing
  async createPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const invoice = await this.getInvoice(createPaymentDto.invoiceId);

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('Invoice is already paid in full');
    }

    const payment = this.paymentRepository.create({
      ...createPaymentDto,
      status: PaymentStatus.PENDING,
    });

    const savedPayment = await this.paymentRepository.save(payment);

    // Update invoice paid amount and status
    invoice.paidAmount += payment.amount;
    if (invoice.paidAmount >= invoice.amount) {
      invoice.status = InvoiceStatus.PAID;
    } else if (invoice.paidAmount > 0) {
      invoice.status = InvoiceStatus.PARTIALLY_PAID;
    }

    await this.invoiceRepository.save(invoice);
    return savedPayment;
  }

  async processPayment(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['invoice'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = PaymentStatus.COMPLETED;
    return this.paymentRepository.save(payment);
  }

  // Insurance Claims
  async createInsuranceClaim(
    createClaimDto: CreateInsuranceClaimDto,
  ): Promise<InsuranceClaim> {
    const invoice = await this.getInvoice(createClaimDto.invoiceId);

    if (invoice.insuranceClaimId) {
      throw new BadRequestException(
        'Insurance claim already exists for this invoice',
      );
    }

    const claim = this.insuranceClaimRepository.create({
      ...createClaimDto,
      status: ClaimStatus.SUBMITTED,
      submissionDate: new Date(),
    });

    const savedClaim = await this.insuranceClaimRepository.save(claim);

    // Update invoice with claim reference
    invoice.insuranceClaimId = savedClaim.id;
    invoice.status = InvoiceStatus.INSURANCE_PENDING;
    await this.invoiceRepository.save(invoice);

    return savedClaim;
  }

  async processInsuranceClaim(
    claimId: string,
    status: ClaimStatus,
    approvedAmount?: number,
  ): Promise<InsuranceClaim> {
    const claim = await this.insuranceClaimRepository.findOne({
      where: { id: claimId },
      relations: ['invoice'],
    });

    if (!claim) {
      throw new NotFoundException('Insurance claim not found');
    }

    claim.status = status;
    claim.processedDate = new Date();

    if (approvedAmount !== undefined) {
      claim.approvedAmount = approvedAmount;

      // Update invoice insurance coverage
      const invoice = await this.getInvoice(claim.invoiceId);
      invoice.insuranceCoverage = approvedAmount;
      invoice.status =
        status === ClaimStatus.APPROVED
          ? InvoiceStatus.INSURANCE_APPROVED
          : InvoiceStatus.INSURANCE_REJECTED;
      await this.invoiceRepository.save(invoice);
    }

    return this.insuranceClaimRepository.save(claim);
  }

  // Financial Reporting
  async generateFinancialReport(
    reportDto: GenerateFinancialReportDto,
  ): Promise<FinancialReport> {
    const { startDate, endDate } = reportDto;

    // Get all invoices for the period
    const invoices = await this.invoiceRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['payments'],
    });

    // Get all insurance claims for the period
    const claims = await this.insuranceClaimRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
    });

    // Calculate metrics
    const metrics = {
      totalRevenue: invoices.reduce((sum, inv) => sum + inv.paidAmount, 0),
      totalExpenses: 0, // This would come from an expenses tracking system
      grossProfit: 0,
      netProfit: 0,
      accountsReceivable: invoices.reduce(
        (sum, inv) => sum + (inv.amount - inv.paidAmount),
        0,
      ),
      averagePaymentTime: this.calculateAveragePaymentTime(invoices),
      collectionRate: this.calculateCollectionRate(invoices),
      insuranceClaimSuccess: this.calculateInsuranceClaimSuccess(claims),
      revenueByDepartment: this.calculateRevenueByDepartment(invoices),
      revenueByService: this.calculateRevenueByService(invoices),
      paymentMethodDistribution:
        this.calculatePaymentMethodDistribution(invoices),
      insuranceProviderPerformance:
        this.calculateInsuranceProviderPerformance(claims),
    };

    // Calculate trends
    const trends = await this.calculateTrends(startDate, endDate);

    const report = this.financialReportRepository.create({
      ...reportDto,
      metrics,
      trends,
      recommendations: this.generateRecommendations(metrics, trends),
    });

    return this.financialReportRepository.save(report);
  }

  // Helper methods for financial calculations
  private calculateAveragePaymentTime(invoices: Invoice[]): number {
    // Implementation for calculating average payment time
    return 0;
  }

  private calculateCollectionRate(invoices: Invoice[]): number {
    const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalCollected = invoices.reduce(
      (sum, inv) => sum + inv.paidAmount,
      0,
    );
    return totalBilled ? (totalCollected / totalBilled) * 100 : 0;
  }

  private calculateInsuranceClaimSuccess(claims: InsuranceClaim[]): number {
    const totalClaims = claims.length;
    const approvedClaims = claims.filter(
      (claim) => claim.status === ClaimStatus.APPROVED,
    ).length;
    return totalClaims ? (approvedClaims / totalClaims) * 100 : 0;
  }

  private calculateRevenueByDepartment(
    invoices: Invoice[],
  ): Record<string, number> {
    // Implementation for calculating revenue by department
    return {};
  }

  private calculateRevenueByService(
    invoices: Invoice[],
  ): Record<string, number> {
    // Implementation for calculating revenue by service
    return {};
  }

  private calculatePaymentMethodDistribution(
    invoices: Invoice[],
  ): Record<string, number> {
    // Implementation for calculating payment method distribution
    return {};
  }

  private calculateInsuranceProviderPerformance(
    claims: InsuranceClaim[],
  ): Array<{
    providerId: string;
    totalClaims: number;
    approvedClaims: number;
    rejectedClaims: number;
    averageProcessingTime: number;
    totalAmount: number;
    approvedAmount: number;
  }> {
    // Implementation for calculating insurance provider performance
    return [];
  }

  private async calculateTrends(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    revenueGrowth: number;
    profitMargin: number;
    yearOverYearGrowth: number;
    monthOverMonthGrowth: number;
  }> {
    // Implementation for calculating financial trends
    return {
      revenueGrowth: 0,
      profitMargin: 0,
      yearOverYearGrowth: 0,
      monthOverMonthGrowth: 0,
    };
  }

  private generateRecommendations(metrics: any, trends: any): string[] {
    // Implementation for generating recommendations based on metrics and trends
    return [];
  }
}
