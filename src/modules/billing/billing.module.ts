import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillingController } from './billing.controller';
import { BillingService } from './billing.service';
import { Invoice } from './entities/invoice.entity';
import { Payment } from './entities/payment.entity';
import { InsuranceClaim } from './entities/insurance-claim.entity';
import { FinancialReport } from './entities/financial-report.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Invoice,
      Payment,
      InsuranceClaim,
      FinancialReport,
    ]),
  ],
  controllers: [BillingController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
