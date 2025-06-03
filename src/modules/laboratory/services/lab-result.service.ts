import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LabResult, LabResultStatus } from '../entities/lab-result.entity';
import { LabTest } from '../entities/lab-test.entity';
import { CreateLabResultDto, UpdateLabResultDto } from '../dto/lab-result.dto';

@Injectable()
export class LabResultService {
  constructor(
    @InjectRepository(LabResult)
    private labResultRepository: Repository<LabResult>,
    @InjectRepository(LabTest)
    private labTestRepository: Repository<LabTest>
  ) {}

  async create(createLabResultDto: CreateLabResultDto): Promise<LabResult> {
    const labResult = this.labResultRepository.create(createLabResultDto);
    const savedResult = await this.labResultRepository.save(labResult);
    
    await this.interpretResult(savedResult.id);
    
    return savedResult;
  }

  async findAll(query: any): Promise<{ data: LabResult[]; total: number }> {
    const { page = 1, limit = 10, status, isAbnormal, orderId } = query;
    
    const queryBuilder = this.labResultRepository.createQueryBuilder('result')
      .leftJoinAndSelect('result.labOrder', 'order')
      .leftJoinAndSelect('result.labTest', 'test')
      .leftJoinAndSelect('order.patient', 'patient');

    if (status) queryBuilder.andWhere('result.status = :status', { status });
    if (isAbnormal !== undefined) queryBuilder.andWhere('result.isAbnormal = :isAbnormal', { isAbnormal });
    if (orderId) queryBuilder.andWhere('result.labOrderId = :orderId', { orderId });

    const [data, total] = await queryBuilder
      .orderBy('result.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<LabResult> {
    const labResult = await this.labResultRepository.findOne({
      where: { id },
      relations: ['labOrder', 'labTest', 'labOrder.patient']
    });

    if (!labResult) {
      throw new NotFoundException('Lab result not found');
    }

    return labResult;
  }

  async update(id: string, updateLabResultDto: UpdateLabResultDto): Promise<LabResult> {
    const labResult = await this.findOne(id);
    Object.assign(labResult, updateLabResultDto);
    
    const updatedResult = await this.labResultRepository.save(labResult);
    await this.interpretResult(id);
    
    return updatedResult;
  }

  async remove(id: string): Promise<void> {
    const labResult = await this.findOne(id);
    await this.labResultRepository.remove(labResult);
  }

  async verifyResult(id: string, verificationData: any): Promise<LabResult> {
    const labResult = await this.findOne(id);
    
    labResult.status = LabResultStatus.VERIFIED;
    labResult.verifiedBy = verificationData.verifiedBy;
    labResult.verifiedAt = new Date();
    
    return this.labResultRepository.save(labResult);
  }

  async interpretResult(id: string): Promise<LabResult> {
    const labResult = await this.findOne(id);
    const labTest = await this.labTestRepository.findOne({ where: { id: labResult.labTestId } });
    
    if (!labTest || !labResult.value) {
      return labResult;
    }

    const numericValue = parseFloat(labResult.value);
    if (isNaN(numericValue)) {
      return labResult;
    }

    const referenceRanges = labTest.referenceRanges || [];
    const applicableRange = this.findApplicableReferenceRange(referenceRanges, labResult);
    
    if (applicableRange) {
      labResult.referenceRange = applicableRange.normalRange;
      labResult.isAbnormal = numericValue < applicableRange.minValue || numericValue > applicableRange.maxValue;
      
      if (labResult.isAbnormal) {
        labResult.interpretation = numericValue < applicableRange.minValue ? 'Below normal range' : 'Above normal range';
      } else {
        labResult.interpretation = 'Within normal range';
      }
    }

    return this.labResultRepository.save(labResult);
  }

  async findByOrder(orderId: string): Promise<LabResult[]> {
    return this.labResultRepository.find({
      where: { labOrderId: orderId },
      relations: ['labTest']
    });
  }

  async getAbnormalResults(query: any): Promise<{ data: LabResult[]; total: number }> {
    const { page = 1, limit = 10, severity } = query;
    
    const queryBuilder = this.labResultRepository.createQueryBuilder('result')
      .leftJoinAndSelect('result.labOrder', 'order')
      .leftJoinAndSelect('result.labTest', 'test')
      .leftJoinAndSelect('order.patient', 'patient')
      .where('result.isAbnormal = :isAbnormal', { isAbnormal: true })
      .andWhere('result.status = :status', { status: LabResultStatus.VERIFIED });

    const [data, total] = await queryBuilder
      .orderBy('result.verifiedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { data, total };
  }

  private findApplicableReferenceRange(referenceRanges: any[], labResult: LabResult): any {
    return referenceRanges.find(range => 
      (!range.ageGroup || this.isAgeGroupApplicable(range.ageGroup, labResult)) &&
      (!range.gender || this.isGenderApplicable(range.gender, labResult))
    );
  }

  private isAgeGroupApplicable(ageGroup: string, labResult: LabResult): boolean {
    return true;
  }

  private isGenderApplicable(gender: string, labResult: LabResult): boolean {
    return true;
  }
}
