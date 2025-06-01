import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Drug } from './entities/drug.entity';
import { Prescription } from './entities/prescription.entity';
import { DrugInteractionLog } from './entities/drug-interaction-log.entity';
import { DrugSafetyLog } from './entities/drug-safety-log.entity';

import { CreateDrugDto } from './dto/create-drug.dto';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { CheckDrugInteractionDto } from './dto/check-interaction.dto';
import { CheckDrugSafetyDto } from './dto/check-safety.dto';

@Injectable()
export class PharmacyService {
  constructor(
    @InjectRepository(Drug)
    private readonly drugRepository: Repository<Drug>,

    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,

    @InjectRepository(DrugInteractionLog)
    private readonly interactionRepo: Repository<DrugInteractionLog>,

    @InjectRepository(DrugSafetyLog)
    private readonly safetyRepo: Repository<DrugSafetyLog>,
  ) {}

  async createDrug(createDrugDto: CreateDrugDto): Promise<Drug> {
    const drug = this.drugRepository.create(createDrugDto);
    return this.drugRepository.save(drug);
  }

  async getAllDrugs(): Promise<Drug[]> {
    return this.drugRepository.find();
  }

  async getDrugById(id: number): Promise<Drug> {
    const drug = await this.drugRepository.findOne({ where: { id } });
    if (!drug) {
      throw new NotFoundException('Drug not found');
    }
    return drug;
  }

  async createPrescription(dto: CreatePrescriptionDto): Promise<Prescription> {
    const drug = await this.getDrugById(dto.drugId);

    if (drug.quantityAvailable < dto.quantity) {
      throw new BadRequestException('Not enough drug quantity available');
    }

    const prescription = this.prescriptionRepository.create({
      patientId: dto.patientId,
      drug,
      quantity: dto.quantity,
      prescribedBy: dto.prescribedBy,
    });

    // Decrement drug inventory
    drug.quantityAvailable -= dto.quantity;
    await this.drugRepository.save(drug);

    return this.prescriptionRepository.save(prescription);
  }

  async getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
    return this.prescriptionRepository.find({
      where: { patientId },
      relations: ['drug'],
    });
  }

  async checkDrugInteractions(
    dto: CheckDrugInteractionDto,
  ): Promise<{ risky: boolean; conflicts: string[] }> {
    const riskyCombinations = [
      [1, 2],
      [3, 5],
    ];

    const conflicts: string[] = [];

    for (const pair of riskyCombinations) {
      if (pair.every((id) => dto.drugIds.includes(id))) {
        conflicts.push(`Drugs ${pair.join(' & ')} have known interaction`);
      }
    }

    return {
      risky: conflicts.length > 0,
      conflicts,
    };
  }

  async checkDrugInteraction(dto: CheckDrugInteractionDto) {
    const { drugs } = dto;

    const interactionResult = {
      warning: drugs.includes('Ibuprofen') && drugs.includes('Aspirin'),
      details: 'Ibuprofen and Aspirin can increase the risk of bleeding.',
    };

    const log = this.interactionRepo.create({
      drugsChecked: drugs,
      interactionResult,
    });

    await this.interactionRepo.save(log);
    return interactionResult;
  }

  async checkDrugSafety(dto: CheckDrugSafetyDto) {
    const { drug, conditions } = dto;

    const safetyResult = {
      safe: !(drug === 'Ibuprofen' && conditions.includes('asthma')),
      reason:
        drug === 'Ibuprofen' && conditions.includes('asthma')
          ? 'Ibuprofen may trigger asthma symptoms.'
          : 'No known contraindications.',
    };

    const log = this.safetyRepo.create({
      drug,
      patientConditions: conditions,
      safetyResult,
    });

    await this.safetyRepo.save(log);
    return safetyResult;
  }
}
