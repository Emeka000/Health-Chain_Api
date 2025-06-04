import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Billing } from '../entities/billing.entity';
import { Claim } from '../entities/claim.entity';
import { Payment } from '../entities/payment.entity';

@Injectable()
export class RevenueCycleService {
  constructor(
    @InjectRepository(Billing)
    private billingRepository: Repository<Billing>,
    @InjectRepository(Claim)
    private claimRepository: Repository<Claim>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async getRevenueCycleMetrics(startDate: Date, endDate: Date): Promise<any> {
    const billings = await this.billingRepository.find({
      where: {
        serviceDate: {
          gte: startDate,
          lte: endDate,
        } as any,
      },
      relations: ['claims', 'claims.payments'],
    });

    const metrics = {
      totalCharges: 0,
      totalCollections: 0,
      collectionRate: 0,
      averageDaysInAR: 0,
      claimSubmissionRate: 0,
      firstPassRate: 0,
      denialRate: 0,
      agingAnalysis: {
        current: 0,
        days31to60: 0,
        days61to90: 0,
        days91to120: 0,
        over120: 0,
      },
    };

    billings.forEach(billing => {
      metrics.totalCharges += Number(billing.totalAmount);
      metrics.totalCollections += Number(billing.paidAmount);

      // Calculate aging
      const daysSinceService = Math.floor(
        (new Date().getTime() - billing.serviceDate.getTime()) /