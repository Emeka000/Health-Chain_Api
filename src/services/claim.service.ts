import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Claim, ClaimStatus } from '../entities/claim.entity';
import { CreateClaimDto } from '../dto/claim.dto';

@Injectable()
export class ClaimService {
  constructor(
    @InjectRepository(Claim)
    private claimRepository: Repository<Claim>,
  ) {}

  async generateClaim(createClaimDto: CreateClaimDto): Promise<Claim> {
    const claimNumber = this.generateClaimNumber();
    
    const claim = this.claimRepository.create({
      ...createClaimDto,
      claimNumber,
      status: ClaimStatus.DRAFT,
      submissionDate: new Date(),
    });

    // Generate claim data in standard format (ANSI X12 837)
    const claimData = await this.generateClaimData(claim);
    claim.claimData = claimData;

    return this.claimRepository.save(claim);
  }

  async submitClaim(id: string): Promise<Claim> {
    const claim = await this.claimRepository.findOne({
      where: { id },
      relations: ['billing', 'insurance', 'billing.billingCodes', 'billing.patient'],
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${id} not found`);
    }

    // Validate claim before submission
    const validationResult = this.validateClaim(claim);
    if (!validationResult.isValid) {
      throw new Error(`Claim validation failed: ${validationResult.errors.join(', ')}`);
    }

    // Submit to clearinghouse (mock implementation)
    const submissionResult = await this.submitToClearinghouse(claim);
    
    claim.status = submissionResult.success ? ClaimStatus.SUBMITTED : ClaimStatus.DRAFT;
    claim.submissionDate = new Date();

    return this.claimRepository.save(claim);
  }

  private generateClaimNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `CLM${timestamp.slice(-6)}${random}`;
  }

  private async generateClaimData(claim: Claim): Promise<any> {
    // Generate ANSI X12 837 format claim data
    return {
      header: {
        claimNumber: claim.claimNumber,
        submissionDate: claim.submissionDate,
        billingProvider: 'PROVIDER_INFO',
      },
      patient: {
        // Patient demographics from claim.billing.patient
      },
      insurance: {
        // Insurance details from claim.insurance
      },
      services: {
        // Service details from claim.billing.billingCodes
      },
    };
  }

  private validateClaim(claim: Claim): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!claim.billing) errors.push('Billing information is required');
    if (!claim.insurance) errors.push('Insurance information is required');
    if (!claim.billedAmount || claim.billedAmount <= 0) errors.push('Billed amount must be greater than zero');

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private async submitToClearinghouse(claim: Claim): Promise<{ success: boolean; message?: string }> {
    // Mock clearinghouse submission - replace with actual API calls
    return {
      success: true,
      message: 'Claim submitted successfully',
    };
  }

  async findClaimsByStatus(status: ClaimStatus): Promise<Claim[]> {
    return this.claimRepository.find({
      where: { status },
      relations: ['billing', 'insurance', 'payments', 'denials'],
    });
  }
}