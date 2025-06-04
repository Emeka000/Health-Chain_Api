import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Pharmacy } from '../entities/pharmacy.entity';
import { CreatePharmacyDto } from '../dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from '../dto/update-pharmacy.dto';

@Injectable()
export class PharmacyService {
  constructor(
    @InjectRepository(Pharmacy)
    private pharmacyRepository: Repository<Pharmacy>,
  ) {}

  async create(createPharmacyDto: CreatePharmacyDto): Promise<Pharmacy> {
    const pharmacy = this.pharmacyRepository.create(createPharmacyDto);
    return this.pharmacyRepository.save(pharmacy);
  }

  async findAll(filters: Partial<Pharmacy> = {}): Promise<Pharmacy[]> {
    return this.pharmacyRepository.find({
      where: filters,
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Pharmacy> {
    const pharmacy = await this.pharmacyRepository.findOne({
      where: { id },
      relations: ['prescriptions'],
    });
    
    if (!pharmacy) {
      throw new NotFoundException(`Pharmacy with ID ${id} not found`);
    }
    
    return pharmacy;
  }

  async findByName(name: string): Promise<Pharmacy[]> {
    return this.pharmacyRepository.find({
      where: { name: name },
    });
  }

  async findActive(): Promise<Pharmacy[]> {
    return this.pharmacyRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async update(id: string, updatePharmacyDto: UpdatePharmacyDto): Promise<Pharmacy> {
    const pharmacy = await this.findOne(id);
    Object.assign(pharmacy, updatePharmacyDto);
    return this.pharmacyRepository.save(pharmacy);
  }

  async remove(id: string): Promise<void> {
    const pharmacy = await this.findOne(id);
    await this.pharmacyRepository.remove(pharmacy);
  }

  async searchNearby(zipCode: string, radius: number = 10): Promise<Pharmacy[]> {
    // In a real implementation, this would use a geolocation service or database query
    // For this example, we'll just filter by active status and sort by name
    
    // Simulated implementation - in a real system you would:
    // 1. Use a geocoding service to convert zipCode to lat/long
    // 2. Use a spatial query to find pharmacies within the radius
    // 3. Return sorted results by distance
    
    return this.pharmacyRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getIntegratedPharmacies(): Promise<Pharmacy[]> {
    return this.pharmacyRepository.find({
      where: { isActive: true, isIntegrated: true },
      order: { name: 'ASC' },
    });
  }
}
