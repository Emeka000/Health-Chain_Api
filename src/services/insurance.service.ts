import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Insurance, InsuranceStatus } from '../entities/insurance.entity';
import { CreateInsuranceDto, UpdateInsuranceDto } from '../dto/insurance.dto';

@Injectable()
export class InsuranceService {
  constructor(
    @InjectRepository(Insurance)
    private insuranceRepository: Repository<Insurance>,
  ) {}

  async create(createInsuranceDto: CreateInsuranceDto): Promise<Insurance> {
    const insurance = this.insuranceRepository.create(createInsuranceDto);
    return this.insuranceRepository.save(insurance);
  }

  async findByPatient(patientId: string): Promise<Insurance[]> {
    return this.insuranceRepository.find({
      where: { patientId },
      order: { type: 'ASC' },
    });
  }

  async verifyInsurance(id: string): Promise<Insurance> {
    const insurance = await this.insuranceRepository.findOne({ where: { id } });
    if (!insurance) {
      throw new NotFoundException(`Insurance with ID ${id} not found`);
    }

    // Mock insurance verification - in real implementation, this would call external APIs
    const verificationResult = await this.performInsuranceVerification(insurance);
    
    insurance.status = verificationResult.isValid ? InsuranceStatus.ACTIVE : InsuranceStatus.INACTIVE;
    insurance.verificationDetails = verificationResult;
    insurance.lastVerificationDate = new Date();

    return this.insuranceRepository.save(insurance);
  }

  private async performInsuranceVerification(insurance: Insurance): Promise<any> {
    // Mock verification - replace with actual insurance verification API calls
    return {
      isValid: true,
      eligibilityStatus: 'active',
      coverageDetails: {
        copay: insurance.copayAmount,
        deductible: insurance.deductibleAmount,
        coinsurance: insurance.coinsurancePercent,
      },
      verificationDate: new Date(),
    };
  }

  async checkAuthorization(insuranceId: string, procedureCodes: string[]): Promise<any> {
    const insurance = await this.insuranceRepository.findOne({ where: { id: insuranceId } });
    if (!insurance) {
      throw new NotFoundException(`Insurance with ID ${insuranceId} not found`);
    }

    // Mock authorization check - replace with actual prior auth API calls
    const authResults = procedureCodes.map(code => ({
      procedureCode: code,
      authorizationRequired: this.requiresAuthorization(code),
      authorizationNumber: this.requiresAuthorization(code) ? `AUTH${Date.now()}` : null,
      status: 'approved',
    }));

    return {
      insuranceId,
      authorizations: authResults,
      checkedDate: new Date(),
    };
  }

  private requiresAuthorization(procedureCode: string): boolean {
    // Define procedures that typically require prior authorization
    const authRequiredCodes = ['99285', '99286', '70450', '70460', '70470'];
    return authRequiredCodes.includes(procedureCode);
  }
}
