import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DosageForm, DrugSchedule, Drug } from '../entities/drug.entity';

export interface CreateDrugDto {
  ndcCode: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  strength: number;
  strengthUnit: string;
  dosageForm: DosageForm;
  schedule?: DrugSchedule;
  activeIngredients: string[];
  indications?: string[];
  contraindications?: string[];
  sideEffects?: string[];
  interactions?: string[];
  allergyTriggers?: string[];
  unitPrice: number;
  description?: string;
}

@Injectable()
export class DrugService {
  constructor(
    @InjectRepository(Drug)
    private drugRepository: Repository<Drug>,
  ) {}

  async create(createDrugDto: CreateDrugDto): Promise<Drug> {
    // Validate NDC format (should be 11 digits)
    if (!/^\d{11}$/.test(createDrugDto.ndcCode.replace(/-/g, ''))) {
      throw new BadRequestException('Invalid NDC code format');
    }

    const existingDrug = await this.drugRepository.findOne({
      where: { ndcCode: createDrugDto.ndcCode }
    });

    if (existingDrug) {
      throw new BadRequestException('Drug with this NDC code already exists');
    }

    const drug = this.drugRepository.create(createDrugDto);
    return await this.drugRepository.save(drug);
  }

  async findAll(): Promise<Drug[]> {
    return await this.drugRepository.find({
      where: { isActive: true },
      relations: ['inventoryItems']
    });
  }

  async findByNdc(ndcCode: string): Promise<Drug> {
    const drug = await this.drugRepository.findOne({
      where: { ndcCode, isActive: true },
      relations: ['inventoryItems']
    });

    if (!drug) {
      throw new NotFoundException('Drug not found');
    }

    return drug;
  }

  async findById(id: string): Promise<Drug> {
    const drug = await this.drugRepository.findOne({
      where: { id, isActive: true },
      relations: ['inventoryItems']
    });

    if (!drug) {
      throw new NotFoundException('Drug not found');
    }

    return drug;
  }

  async checkDrugInteractions(drugIds: string[]): Promise<string[]> {
    const drugs = await this.drugRepository.findByIds(drugIds);
    const interactions: string[] = [];

    for (let i = 0; i < drugs.length; i++) {
      for (let j = i + 1; j < drugs.length; j++) {
        const drug1 = drugs[i];
        const drug2 = drugs[j];

        // Check if drug1 has interactions with drug2's active ingredients
        const hasInteraction = drug1.interactions.some(interaction =>
          drug2.activeIngredients.some(ingredient =>
            interaction.toLowerCase().includes(ingredient.toLowerCase())
          )
        );

        if (hasInteraction) {
          interactions.push(`${drug1.brandName} may interact with ${drug2.brandName}`);
        }
      }
    }

    return interactions;
  }

  async searchDrugs(query: string): Promise<Drug[]> {
    return await this.drugRepository
      .createQueryBuilder('drug')
      .where('drug.isActive = :isActive', { isActive: true })
      .andWhere(
        '(LOWER(drug.brandName) LIKE LOWER(:query) OR LOWER(drug.genericName) LIKE LOWER(:query) OR drug.ndcCode LIKE :query)',
        { query: `%${query}%` }
      )
      .getMany();
  }
}