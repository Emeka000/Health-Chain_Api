import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PhysicalProduct, DigitalProduct } from '../entities/concrete-table/product.entity';
import { BaseInheritanceRepository } from './base-inheritance.repository';
import { InheritanceType } from '../decorators/inheritance.decorator';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(PhysicalProduct)
    private physicalProductRepository: Repository<PhysicalProduct>,
    @InjectRepository(DigitalProduct)
    private digitalProductRepository: Repository<DigitalProduct>
  ) {}

  async findAllPhysicalProducts(): Promise<PhysicalProduct[]> {
    return this.physicalProductRepository.find({
      where: { isActive: true }
    });
  }

  async findAllDigitalProducts(): Promise<DigitalProduct[]> {
    return this.digitalProductRepository.find({
      where: { isActive: true }
    });
  }

  async findProductsBySku(sku: string): Promise<(PhysicalProduct | DigitalProduct)[]> {
    const [physical, digital] = await Promise.all([
      this.physicalProductRepository.find({ where: { sku } }),
      this.digitalProductRepository.find({ where: { sku } })
    ]);
    
    return [...physical, ...digital];
  }

  async findProductsByPriceRange(
    minPrice: number, 
    maxPrice: number
  ): Promise<{ physical: PhysicalProduct[]; digital: DigitalProduct[] }> {
    const [physical, digital] = await Promise.all([
      this.physicalProductRepository
        .createQueryBuilder('product')
        .where('product.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice })
        .andWhere('product.isActive = :isActive', { isActive: true })
        .getMany(),
      this.digitalProductRepository
        .createQueryBuilder('product')
        .where('product.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice })
        .andWhere('product.isActive = :isActive', { isActive: true })
        .getMany()
    ]);
    
    return { physical, digital };
  }

  async findLowStockPhysicalProducts(threshold: number = 10): Promise<PhysicalProduct[]> {
    return this.physicalProductRepository.find({
      where: {
        stockQuantity: threshold,
        isActive: true
      }
    });
  }

  async findDigitalProductsByFormat(fileFormat: string): Promise<DigitalProduct[]> {
    return this.digitalProductRepository.find({
      where: { fileFormat, isActive: true }
    });
  }

  async getProductStatistics(): Promise<{
    totalPhysical: number;
    totalDigital: number;
    avgPhysicalPrice: number;
    avgDigitalPrice: number;
  }> {
    const [physicalStats, digitalStats] = await Promise.all([
      this.physicalProductRepository
        .createQueryBuilder('product')
        .select('COUNT(*)', 'count')
        .addSelect('AVG(product.price)', 'avgPrice')
        .where('product.isActive = :isActive', { isActive: true })
        .getRawOne(),
      this.digitalProductRepository
        .createQueryBuilder('product')
        .select('COUNT(*)', 'count')
        .addSelect('AVG(product.price)', 'avgPrice')
        .where('product.isActive = :isActive', { isActive: true })
        .getRawOne()
    ]);

    return {
      totalPhysical: parseInt(physicalStats.count),
      totalDigital: parseInt(digitalStats.count),
      avgPhysicalPrice: parseFloat(physicalStats.avgPrice) || 0,
      avgDigitalPrice: parseFloat(digitalStats.avgPrice) || 0
    };
  }
}
