import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { CreateInvoiceDto } from '../src/modules/billing/dto/create-invoice.dto';
import { CreatePaymentDto } from '../src/modules/billing/dto/create-payment.dto';
import { CreateInsuranceClaimDto } from '../src/modules/billing/dto/create-insurance-claim.dto';
import { PaymentMethod } from '../src/modules/billing/enums/payment-method.enum';
import { ClaimStatus } from '../src/modules/billing/enums/claim-status.enum';

describe('BillingController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let createdInvoiceId: string;
  let createdPaymentId: string;
  let createdClaimId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Get auth token (assuming you have an auth endpoint)
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        username: 'admin',
        password: 'admin123',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/billing/invoices (POST)', () => {
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

      const response = await request(app.getHttpServer())
        .post('/billing/invoices')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createInvoiceDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.patientId).toBe(createInvoiceDto.patientId);
      expect(response.body.amount).toBe(1000);

      createdInvoiceId = response.body.id;
    });
  });

  describe('/billing/invoices/:id (GET)', () => {
    it('should get an invoice by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/billing/invoices/${createdInvoiceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(createdInvoiceId);
    });

    it('should return 404 for non-existent invoice', async () => {
      await request(app.getHttpServer())
        .get('/billing/invoices/999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/billing/payments (POST)', () => {
    it('should create a payment', async () => {
      const createPaymentDto: CreatePaymentDto = {
        invoiceId: createdInvoiceId,
        amount: 500,
        paymentMethod: PaymentMethod.CREDIT_CARD,
        paymentDetails: {
          cardLast4: '4242',
        },
      };

      const response = await request(app.getHttpServer())
        .post('/billing/payments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createPaymentDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.amount).toBe(createPaymentDto.amount);

      createdPaymentId = response.body.id;
    });
  });

  describe('/billing/insurance-claims (POST)', () => {
    it('should create an insurance claim', async () => {
      const createClaimDto: CreateInsuranceClaimDto = {
        invoiceId: createdInvoiceId,
        patientId: '1',
        insuranceProviderId: '1',
        policyNumber: '12345',
        claimAmount: 800,
        diagnosisCodes: ['A00'],
        procedureCodes: ['B00'],
        serviceDate: new Date(),
      };

      const response = await request(app.getHttpServer())
        .post('/billing/insurance-claims')
        .set('Authorization', `Bearer ${authToken}`)
        .send(createClaimDto)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.claimAmount).toBe(createClaimDto.claimAmount);

      createdClaimId = response.body.id;
    });
  });

  describe('/billing/insurance-claims/:id/process (PUT)', () => {
    it('should process an insurance claim', async () => {
      const response = await request(app.getHttpServer())
        .put(`/billing/insurance-claims/${createdClaimId}/process`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          status: ClaimStatus.APPROVED,
          approvedAmount: 800,
        })
        .expect(200);

      expect(response.body.id).toBe(createdClaimId);
      expect(response.body.status).toBe(ClaimStatus.APPROVED);
      expect(response.body.approvedAmount).toBe(800);
    });
  });

  describe('/billing/reports (POST)', () => {
    it('should generate a financial report', async () => {
      const response = await request(app.getHttpServer())
        .post('/billing/reports')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          reportType: 'REVENUE',
          period: 'MONTHLY',
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('metrics');
      expect(response.body).toHaveProperty('trends');
    });
  });

  describe('/billing/analytics/revenue (GET)', () => {
    it('should get revenue analytics', async () => {
      const response = await request(app.getHttpServer())
        .get('/billing/analytics/revenue')
        .set('Authorization', `Bearer ${authToken}`)
        .query({
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        })
        .expect(200);

      expect(response.body).toHaveProperty('metrics');
      expect(response.body.metrics).toHaveProperty('totalRevenue');
    });
  });
});
