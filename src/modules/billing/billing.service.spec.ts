import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BillingService } from './billing.service';
import { Invoice } from './entities/invoice.entity';
import { Payment } from './entities/payment.entity';
import { InsuranceClaim } from './entities/insurance-claim.entity';
import { FinancialReport } from './entities/financial-report.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateInsuranceClaimDto } from './dto/create-insurance-claim.dto';
import { InvoiceStatus } from './enums/invoice-status.enum';
import { PaymentStatus } from './enums/payment-status.enum';
import { PaymentMethod } from './enums/payment-method.enum';
import { ClaimStatus } from './enums/claim-status.enum';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BillingService', () => {
  let service: BillingService;
  let invoiceRepository: Repository<Invoice>;
  let paymentRepository: Repository<Payment>;
  let insuranceClaimRepository: Repository<InsuranceClaim>;
  let financialReportRepository: Repository<FinancialReport>;

  const mockInvoice: Invoice = {
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

  const mockPayment: Payment = {
    id: '1',
    invoice: mockInvoice,
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

  const mockInsuranceClaim: InsuranceClaim = {
    id: '1',
    invoiceId: '1',
    invoice: mockInvoice,
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: getRepositoryToken(Invoice),
          useValue: {
            create: jest.fn().mockReturnValue(mockInvoice),
            save: jest.fn().mockResolvedValue(mockInvoice),
            findOne: jest.fn().mockResolvedValue(mockInvoice),
            find: jest.fn().mockResolvedValue([mockInvoice]),
          },
        },
        {
          provide: getRepositoryToken(Payment),
          useValue: {
            create: jest.fn().mockReturnValue(mockPayment),
            save: jest.fn().mockResolvedValue(mockPayment),
            findOne: jest.fn().mockResolvedValue(mockPayment),
          },
        },
        {
          provide: getRepositoryToken(InsuranceClaim),
          useValue: {
            create: jest.fn().mockReturnValue(mockInsuranceClaim),
            save: jest.fn().mockResolvedValue(mockInsuranceClaim),
            findOne: jest.fn().mockResolvedValue(mockInsuranceClaim),
            find: jest.fn().mockResolvedValue([mockInsuranceClaim]),
          },
        },
        {
          provide: getRepositoryToken(FinancialReport),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
    invoiceRepository = module.get<Repository<Invoice>>(
      getRepositoryToken(Invoice),
    );
    paymentRepository = module.get<Repository<Payment>>(
      getRepositoryToken(Payment),
    );
    insuranceClaimRepository = module.get<Repository<InsuranceClaim>>(
      getRepositoryToken(InsuranceClaim),
    );
    financialReportRepository = module.get<Repository<FinancialReport>>(
      getRepositoryToken(FinancialReport),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createInvoice', () => {
    it('should create an invoice successfully', async () => {
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

      const result = await service.createInvoice(createInvoiceDto);
      expect(result).toEqual(mockInvoice);
      expect(invoiceRepository.create).toHaveBeenCalled();
      expect(invoiceRepository.save).toHaveBeenCalled();
    });
  });

  describe('getInvoice', () => {
    it('should return an invoice if found', async () => {
      const result = await service.getInvoice('1');
      expect(result).toEqual(mockInvoice);
    });

    it('should throw NotFoundException if invoice not found', async () => {
      jest.spyOn(invoiceRepository, 'findOne').mockResolvedValue(null);
      await expect(service.getInvoice('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createPayment', () => {
    it('should create a payment successfully', async () => {
      const createPaymentDto: CreatePaymentDto = {
        invoiceId: '1',
        amount: 500,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        paymentDetails: {
          cardLast4: '4242',
        },
      };

      const result = await service.createPayment(createPaymentDto);
      expect(result).toEqual(mockPayment);
      expect(paymentRepository.create).toHaveBeenCalled();
      expect(paymentRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if invoice is already paid', async () => {
      const paidInvoice = { ...mockInvoice, status: InvoiceStatus.PAID };
      jest.spyOn(invoiceRepository, 'findOne').mockResolvedValue(paidInvoice);

      const createPaymentDto: CreatePaymentDto = {
        invoiceId: '1',
        amount: 500,
        paymentMethod: PaymentMethod.CREDIT_CARD,
      };

      await expect(service.createPayment(createPaymentDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createInsuranceClaim', () => {
    it('should create an insurance claim successfully', async () => {
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

      const result = await service.createInsuranceClaim(createClaimDto);
      expect(result).toEqual(mockInsuranceClaim);
      expect(insuranceClaimRepository.create).toHaveBeenCalled();
      expect(insuranceClaimRepository.save).toHaveBeenCalled();
    });

    it('should throw BadRequestException if claim already exists', async () => {
      const invoiceWithClaim = { ...mockInvoice, insuranceClaimId: '1' };
      jest
        .spyOn(invoiceRepository, 'findOne')
        .mockResolvedValue(invoiceWithClaim);

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

      await expect(
        service.createInsuranceClaim(createClaimDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('processInsuranceClaim', () => {
    it('should process an insurance claim successfully', async () => {
      const result = await service.processInsuranceClaim(
        '1',
        ClaimStatus.APPROVED,
        800,
      );
      expect(result).toEqual(mockInsuranceClaim);
      expect(insuranceClaimRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException if claim not found', async () => {
      jest.spyOn(insuranceClaimRepository, 'findOne').mockResolvedValue(null);
      await expect(
        service.processInsuranceClaim('999', ClaimStatus.APPROVED),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
