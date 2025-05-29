import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReportType } from '../enums/report-type.enum';
import { ReportPeriod } from '../enums/report-period.enum';

@Entity('financial_reports')
export class FinancialReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: ReportType })
  reportType: ReportType;

  @Column({ type: 'enum', enum: ReportPeriod })
  period: ReportPeriod;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'jsonb' })
  metrics: {
    totalRevenue: number;
    totalExpenses: number;
    grossProfit: number;
    netProfit: number;
    accountsReceivable: number;
    averagePaymentTime: number;
    collectionRate: number;
    insuranceClaimSuccess: number;
    revenueByDepartment: Record<string, number>;
    revenueByService: Record<string, number>;
    paymentMethodDistribution: Record<string, number>;
    insuranceProviderPerformance: Array<{
      providerId: string;
      totalClaims: number;
      approvedClaims: number;
      rejectedClaims: number;
      averageProcessingTime: number;
      totalAmount: number;
      approvedAmount: number;
    }>;
  };

  @Column({ type: 'jsonb', nullable: true })
  trends: {
    revenueGrowth: number;
    profitMargin: number;
    yearOverYearGrowth: number;
    monthOverMonthGrowth: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  recommendations: string[];

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
