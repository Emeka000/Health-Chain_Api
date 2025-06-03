import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  PolicyProcedure,
  PolicyStatus,
} from '../entities/policy-procedure.entity';
import { NotificationService } from './notification.service';

@Injectable()
export class PolicyService {
  private readonly logger = new Logger(PolicyService.name);

  constructor(
    @InjectRepository(PolicyProcedure)
    private readonly policyRepository: Repository<PolicyProcedure>,
    private readonly notificationService: NotificationService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async checkPoliciesDueForReview(): Promise<void> {
    this.logger.log('Checking policies due for review');

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const policiesDueForReview = await this.policyRepository.find({
      where: {
        status: PolicyStatus.ACTIVE,
        nextReviewDate: LessThan(thirtyDaysFromNow),
      },
    });

    for (const policy of policiesDueForReview) {
      // Send notification for policies due for review
      // Implementation would be similar to other notifications
      this.logger.log(
        `Policy ${policy.number} due for review on ${policy.nextReviewDate}`,
      );
    }

    this.logger.log(
      `Found ${policiesDueForReview.length} policies due for review`,
    );
  }
}
