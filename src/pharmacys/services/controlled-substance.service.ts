import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  ControlledSubstanceLog,
  TransactionType,
} from '../entities/controlled-substance-log.entity';
import { Drug } from '../entities/drug.entity';

@Injectable()
export class ControlledSubstanceService {
  constructor(
    @InjectRepository(ControlledSubstanceLog)
    private logRepository: Repository<ControlledSubstanceLog>,
    @InjectRepository(Drug)
    private drugRepository: Repository<Drug>,
  ) {}

  async logDispensing(
    drugId: string,
    quantity: number,
    prescriptionId: string,
    patientId: string,
    pharmacistId: string,
    deaNumber?: string,
  ): Promise<ControlledSubstanceLog> {
    const currentBalance = await this.getCurrentBalance(drugId);

    const log = this.logRepository.create({
      drugId,
      transactionType: TransactionType.DISPENSED,
      quantity,
      runningBalance: currentBalance - quantity,
      prescriptionId,
      patientId,
      pharmacistId,
      deaNumber,
    });

    return await this.logRepository.save(log);
  }

  async logReceiving(
    drugId: string,
    quantity: number,
    pharmacistId: string,
    notes?: string,
  ): Promise<ControlledSubstanceLog> {
    const currentBalance = await this.getCurrentBalance(drugId);

    const log = this.logRepository.create({
      drugId,
      transactionType: TransactionType.RECEIVED,
      quantity,
      runningBalance: currentBalance + quantity,
      pharmacistId,
      notes,
    });

    return await this.logRepository.save(log);
  }

  async logDestruction(
    drugId: string,
    quantity: number,
    pharmacistId: string,
    notes: string,
  ): Promise<ControlledSubstanceLog> {
    const currentBalance = await this.getCurrentBalance(drugId);

    const log = this.logRepository.create({
      drugId,
      transactionType: TransactionType.DESTROYED,
      quantity,
      runningBalance: currentBalance - quantity,
      pharmacistId,
      notes,
    });

    return await this.logRepository.save(log);
  }

  async getCurrentBalance(drugId: string): Promise<number> {
    const latestLog = await this.logRepository.findOne({
      where: { drugId },
      order: { transactionDate: 'DESC' },
    });

    return latestLog ? latestLog.runningBalance : 0;
  }

  async getTransactionHistory(
    drugId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<ControlledSubstanceLog[]> {
    const query = this.logRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.drug', 'drug')
      .where('log.drugId = :drugId', { drugId });

    if (startDate && endDate) {
      query.andWhere('log.transactionDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    return await query.orderBy('log.transactionDate', 'DESC').getMany();
  }

  async generateReport(startDate: Date, endDate: Date): Promise<any> {
    const logs = await this.logRepository.find({
      where: {
        transactionDate: Between(startDate, endDate),
      },
      relations: ['drug'],
      order: { transactionDate: 'ASC' },
    });

    const report = {
      reportPeriod: { startDate, endDate },
      totalTransactions: logs.length,
      transactionsByType: {},
      drugSummary: {},
    };

    // Group by transaction type
    logs.forEach((log) => {
      if (!report.transactionsByType[log.transactionType]) {
        report.transactionsByType[log.transactionType] = 0;
      }
      report.transactionsByType[log.transactionType]++;

      // Group by drug
      const drugKey = `${log.drug.brandName} (${log.drug.ndcCode})`;
      if (!report.drugSummary[drugKey]) {
        report.drugSummary[drugKey] = {
          schedule: log.drug.schedule,
          transactions: [],
          totalDispensed: 0,
          totalReceived: 0,
        };
      }

      report.drugSummary[drugKey].transactions.push({
        date: log.transactionDate,
        type: log.transactionType,
        quantity: log.quantity,
        balance: log.runningBalance,
        prescriptionId: log.prescriptionId,
      });

      if (log.transactionType === TransactionType.DISPENSED) {
        report.drugSummary[drugKey].totalDispensed += log.quantity;
      } else if (log.transactionType === TransactionType.RECEIVED) {
        report.drugSummary[drugKey].totalReceived += log.quantity;
      }
    });

    return report;
  }
}
