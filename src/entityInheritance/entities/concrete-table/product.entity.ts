import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../base/base.entity';
import { InheritanceStrategy, InheritanceType } from '../../decorators/inheritance.decorator';

@InheritanceStrategy(InheritanceType.CONCRETE_TABLE)
export abstract class Product extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'varchar', length: 50 })
  sku: string;

  @Column({ type: 'int', default: 0 })
  stockQuantity: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;
}

@Entity('physical_products')
export class PhysicalProduct extends Product {
  @Column({ type: 'decimal', precision: 8, scale: 2 })
  weight: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  length: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  width: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  height: number;

  @Column({ type: 'varchar', length: 100 })
  shippingClass: string;

  @Column({ type: 'boolean', default: false })
  requiresSpecialHandling: boolean;
}

@Entity('digital_products')
export class DigitalProduct extends Product {
  @Column({ type: 'varchar', length: 500 })
  downloadUrl: string;

  @Column({ type: 'varchar', length: 20 })
  fileFormat: string;

  @Column({ type: 'bigint' })
  fileSize: number;

  @Column({ type: 'int', nullable: true })
  downloadLimit?: number;

  @Column({ type: 'int', nullable: true })
  expirationDays?: number;

  @Column({ type: 'varchar', length: 100 })
  licenseType: string;
}

