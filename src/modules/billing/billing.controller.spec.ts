import { Test, TestingModule } from '@nestjs/testing';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateInsuranceClaimDto } from './dto/create-insurance-claim.dto';
import { GenerateFinancialReportDto } from './dto/generate-financial-report.dto';
import { InvoiceStatus } from './enums/invoice-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';
import { ClaimStatus } from './enums/claim-status.enum';
import { ReportType } from './enums/report-type.enum';
import { ReportPeriod } from './enums/report-period.enum';

describe('BillingController', () => {
  let controller: BillingController;
  let service: BillingService;

  const mockInvoice = {
    id: '1',
    patientId: '1',
    amount: 1000,
    paidAmount: 0,
    status: InvoiceStatus.PENDING,
    items: [
      {
        description: 'Consultation',
        quantity: 1,
        unitPrice: 1000,
        total: 1000,
      },
    ],
    insuranceClaimId: '',
    insuranceCoverage: 0,
    dueDate: new Date(),
    payments: [],
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPayment = {
    id: '1',
    invoiceId: '1',
    amount: 500,
    paymentMethod: PaymentMethod.CREDIT_CARD,
    status: PaymentStatus.PENDING,
    transactionId: '123',
    paymentDetails: {
      cardLast4: '4242',
    },
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockInsuranceClaim = {
    id: '1',
    invoiceId: '1',
    patientId: '1',
    insuranceProviderId: '1',
    policyNumber: '12345',
    claimAmount: 800,
    approvedAmount: 0,
    status: ClaimStatus.SUBMITTED,
    diagnosisCodes: ['A00'],
    procedureCodes: ['B00'],
    serviceDate: new Date(),
    submissionDate: new Date(),
    processedDate: new Date(),
    rejectionReason: '',
    supportingDocuments: [],
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockFinancialReport = {
    id: '1',
    reportType: ReportType.REVENUE,
    period: ReportPeriod.MONTHLY,
    startDate: new Date(),
    endDate: new Date(),
    metrics: {
      totalRevenue: 10000,
      totalExpenses: 5000,
      grossProfit: 5000,
      netProfit: 4000,
      accountsReceivable: 2000,
      averagePaymentTime: 15,
      collectionRate: 85,
      insuranceClaimSuccess: 90,
      revenueByDepartment: {},
      revenueByService: {},
      paymentMethodDistribution: {},
      insuranceProviderPerformance: [],
    },
    trends: {
      revenueGrowth: 5,
      profitMargin: 40,
      yearOverYearGrowth: 10,
      monthOverMonthGrowth: 2,
    },
    recommendations: [],
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BillingController],
      providers: [
        {
          provide: BillingService,
          useValue: {
            createInvoice: jest.fn().mockResolvedValue(mockInvoice),
            getInvoice: jest.fn().mockResolvedValue(mockInvoice),
            createPayment: jest.fn().mockResolvedValue(mockPayment),
            processPayment: jest.fn().mockResolvedValue(mockPayment),
            createInsuranceClaim: jest
              .fn()
              .mockResolvedValue(mockInsuranceClaim),
            processInsuranceClaim: jest
              .fn()
              .mockResolvedValue(mockInsuranceClaim),
            generateFinancialReport: jest
              .fn()
              .mockResolvedValue(mockFinancialReport),
          },
        },
      ],
    }).compile();

    controller = module.get<BillingController>(BillingController);
    service = module.get<BillingService>(BillingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createInvoice', () => {
    it('should create an invoice', async () => {
      const createInvoiceDto: CreateInvoiceDto = {
        patientId: '1',
        items: [
          {
            description: 'Consultation',
            quantity: 1,
            unitPrice: 1000,
          },
        ],
      };

      const result = await controller.createInvoice(createInvoiceDto);
      expect(result).toEqual(mockInvoice);
      expect(service.createInvoice).toHaveBeenCalledWith(createInvoiceDto);
    });
  });

  describe('getInvoice', () => {
    it('should get an invoice by id', async () => {
      const result = await controller.getInvoice('1');
      expect(result).toEqual(mockInvoice);
      expect(service.getInvoice).toHaveBeenCalledWith('1');
    });
  });

  describe('createPayment', () => {
    it('should create a payment', async () => {
      const createPaymentDto: CreatePaymentDto = {
        invoiceId: '1',
        amount: 500,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        paymentDetails: {
          cardLast4: '4242',
        },
      };

      const result = await controller.createPayment(createPaymentDto);
      expect(result).toEqual(mockPayment);
      expect(service.createPayment).toHaveBeenCalledWith(createPaymentDto);
    });
  });

  describe('processPayment', () => {
    it('should process a payment', async () => {
      const result = await controller.processPayment('1');
      expect(result).toEqual(mockPayment);
      expect(service.processPayment).toHaveBeenCalledWith('1');
    });
  });

  describe('createInsuranceClaim', () => {
    it('should create an insurance claim', async () => {
      const createClaimDto: CreateInsuranceClaimDto = {
        invoiceId: '1',
        patientId: '1',
        insuranceProviderId: '1',
        policyNumber: '12345',
        claimAmount: 800,
        diagnosisCodes: ['A00'],
        procedureCodes: ['B00'],
        serviceDate: new Date(),
      };

      const result = await controller.createInsuranceClaim(createClaimDto);
      expect(result).toEqual(mockInsuranceClaim);
      expect(service.createInsuranceClaim).toHaveBeenCalledWith(createClaimDto);
    });
  });

  describe('processInsuranceClaim', () => {
    it('should process an insurance claim', async () => {
      const result = await controller.processInsuranceClaim(
        '1',
        ClaimStatus.APPROVED,
        800,
      );
      expect(result).toEqual(mockInsuranceClaim);
      expect(service.processInsuranceClaim).toHaveBeenCalledWith(
        '1',
        ClaimStatus.APPROVED,
        800,
      );
    });
  });

  describe('generateFinancialReport', () => {
    it('should generate a financial report', async () => {
      const reportDto: GenerateFinancialReportDto = {
        reportType: ReportType.REVENUE,
        period: ReportPeriod.MONTHLY,
        startDate: new Date(),
        endDate: new Date(),
      };

      const result = await controller.generateFinancialReport(reportDto);
      expect(result).toEqual(mockFinancialReport);
      expect(service.generateFinancialReport).toHaveBeenCalledWith(reportDto);
    });
  });

  describe('getRevenueAnalytics', () => {
    it('should get revenue analytics', async () => {
      const startDate = new Date();
      const endDate = new Date();

      const result = await controller.getRevenueAnalytics(startDate, endDate);
      expect(result).toEqual(mockFinancialReport);
      expect(service.generateFinancialReport).toHaveBeenCalledWith({
        reportType: ReportType.REVENUE,
        period: ReportPeriod.CUSTOM,
        startDate,
        endDate,
      });
    });
  });
});
