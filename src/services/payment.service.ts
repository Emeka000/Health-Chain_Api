import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentType, PaymentMethod } from '../entities/payment.entity';
import { CreatePaymentDto } from '../dto/payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async processPayment(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const payment = this.paymentRepository.create(createPaymentDto);
    
    // Process payment based on method
    const processResult = await this.processPaymentByMethod(payment);
    
    if (processResult.success) {
      payment.referenceNumber = processResult.referenceNumber;
      return this.paymentRepository.save(payment);
    } else {
      throw new Error(`Payment processing failed: ${processResult.error}`);
    }
  }

  private async processPaymentByMethod(payment: Payment): Promise<any> {
    switch (payment.paymentMethod) {
      case PaymentMethod.CREDIT_CARD:
        return this.processCreditCardPayment(payment);
      case PaymentMethod.ACH:
        return this.processACHPayment(payment);
      case PaymentMethod.CHECK:
        return this.processCheckPayment(payment);
      default:
        return { success: true, referenceNumber: `REF${Date.now()}` };
    }
  }

  private async processCreditCardPayment(payment: Payment): Promise<any> {
    // Mock credit card processing - integrate with payment gateway
    return {
      success: true,
      referenceNumber: `CC${Date.now()}`,
      transactionId: `TXN${Math.random().toString(36).substring(2, 10)}`,
    };
  }

  private async processACHPayment(payment: Payment): Promise<any> {
    // Mock ACH processing
    return {
      success: true,
      referenceNumber: `ACH${Date.now()}`,
      batchId: `BATCH${Math.random().toString(36).substring(2, 8)}`,
    };
  }

  private async processCheckPayment(payment: Payment): Promise<any> {
    // Mock check processing
    return {
      success: true,
      referenceNumber: `CHK${Date.now()}`,
    };
  }

  async getPaymentsByDateRange(startDate: Date, endDate: Date): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: {
        paymentDate: {
          gte: startDate,
          lte: endDate,
        } as any,
      },
      relations: ['claim'],
    });
  }
}