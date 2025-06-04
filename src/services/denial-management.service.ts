import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClaimDenial, AppealStatus } from '../entities/claim-denial.entity';
import { Claim, ClaimStatus } from '../entities/claim.entity';
import { CreateDenialDto, CreateAppealDto } from '../dto/denial.dto';

@Injectable()
export class DenialManagementService {
  constructor(
    @InjectRepository(ClaimDenial)
    private denialRepository: Repository<ClaimDenial>,
    @InjectRepository(Claim)
    private claimRepository: Repository<Claim>,
  ) {}

  async recordDenial(createDenialDto: CreateDenialDto): Promise<ClaimDenial> {
    const denial = this.denialRepository.create(createDenialDto);
    
    // Update claim status to denied
    await this.claimRepository.update(
      createDenialDto.claimId,
      { status: ClaimStatus.DENIED }
    );

    return this.denialRepository.save(denial);
  }

  async submitAppeal(denialId: string, createAppealDto: CreateAppealDto): Promise<ClaimDenial> {
    const denial = await this.denialRepository.findOne({
      where: { id: denialId },
      relations: ['claim'],
    });

    if (!denial) {
      throw new Error(`Denial with ID ${denialId} not found`);
    }

    denial.appealStatus = AppealStatus.APPEAL_SUBMITTED;
    denial.appealDate = new Date();
    denial.appealNotes = createAppealDto.appealNotes;

    // Update claim status
    await this.claimRepository.update(
      denial.claimId,
      { status: ClaimStatus.APPEALED }
    );

    return this.denialRepository.save(denial);
  }

  async getDenialAnalytics(): Promise<any> {
    const denials = await this.denialRepository.find({
      relations: ['claim'],
    });

    const analytics = {
      totalDenials: denials.length,
      denialsByReason: {},
      appealSuccessRate: 0,
      averageDenialAmount: 0,
    };

    // Calculate denial statistics
    denials.forEach(denial => {
      const reason = denial.denialReason;
      analytics.denialsByReason[reason] = (analytics.denialsByReason[reason] || 0) + 1;
    });

    const appeals = denials.filter(d => d.appealStatus !== AppealStatus.NOT_APPEALED);
    const successfulAppeals = denials.filter(d => d.appealStatus === AppealStatus.APPEAL_APPROVED);
    
    analytics.appealSuccessRate = appeals.length > 0 ? 
      (successfulAppeals.length / appeals.length) * 100 : 0;

    return analytics;
  }
}
