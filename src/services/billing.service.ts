import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Billing, BillingStatus } from '../entities/billing.entity';
import { BillingCode, CodeType } from '../entities/billing-code.entity';
import { CreateBillingDto, UpdateBillingDto } from '../dto/billing.dto';

@Injectable()
export class BillingService {
  constructor(
    @InjectRepository(Billing)
    private billingRepository: Repository<Billing>,
    @InjectRepository(BillingCode)
    private billingCodeRepository: Repository<BillingCode>,
  ) {}

  async create(createBillingDto: CreateBillingDto): Promise<Billing> {
    const billing = this.billingRepository.create({
      ...createBillingDto,
      status: BillingStatus.DRAFT,
    });

    const savedBilling = await this.billingRepository.save(billing);

    // Add billing codes if provided
    if (createBillingDto.billingCodes?.length) {
      const billingCodes = createBillingDto.billingCodes.map(code => 
        this.billingCodeRepository.create({
          ...code,
          billingId: savedBilling.id,
        })
      );
      await this.billingCodeRepository.save(billingCodes);
    }

    return this.findOne(savedBilling.id);
  }

  async findAll(): Promise<Billing[]> {
    return this.billingRepository.find({
      relations: ['patient', 'billingCodes', 'claims'],
    });
  }

  async findOne(id: string): Promise<Billing> {
    const billing = await this.billingRepository.findOne({
      where: { id },
      relations: ['patient', 'billingCodes', 'claims'],
    });

    if (!billing) {
      throw new NotFoundException(`Billing record with ID ${id} not found`);
    }

    return billing;
  }

  async update(id: string, updateBillingDto: UpdateBillingDto): Promise<Billing> {
    const billing = await this.findOne(id);
    
    Object.assign(billing, updateBillingDto);
    
    // Recalculate total amount based on billing codes
    if (updateBillingDto.billingCodes) {
      const totalAmount = updateBillingDto.billingCodes.reduce(
        (sum, code) => sum + (code.amount * code.quantity), 0
      );
      billing.totalAmount = totalAmount;
    }

    await this.billingRepository.save(billing);
    return this.findOne(id);
  }

  async validateCodes(codes: Array<{code: string, codeType: CodeType}>): Promise<boolean> {
    // Implementation would validate against CPT/ICD-10 databases
    // For now, return basic validation
    for (const codeItem of codes) {
      if (codeItem.codeType === CodeType.CPT && !this.isValidCPTCode(codeItem.code)) {
        return false;
      }
      if (codeItem.codeType === CodeType.ICD10 && !this.isValidICD10Code(codeItem.code)) {
        return false;
      }
    }
    return true;
  }

  private isValidCPTCode(code: string): boolean {
    // Basic CPT code validation (5 digits)
    return /^\d{5}$/.test(code);
  }

  private isValidICD10Code(code: string): boolean {
    // Basic ICD-10 code validation
    return /^[A-Z]\d{2}(\.\d{1,4})?$/.test(code);
  }
}