import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Drug } from '../entities/drug.entity';
import { InventoryItem } from '../entities/inventory-item.entity';
import { SafetyAlertService } from './safety-alert.service';

export interface CreateInventoryItemDto {
  drugId: string;
  quantity: number;
  reorderLevel: number;
  maxLevel: number;
  lotNumber: string;
  expirationDate: Date;
  supplier: string;
  costPerUnit: number;
  location?: string;
}

export interface UpdateInventoryDto {
  quantity?: number;
  reorderLevel?: number;
  maxLevel?: number;
  location?: string;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(InventoryItem)
    private inventoryRepository: Repository<InventoryItem>,
    @InjectRepository(Drug)
    private drugRepository: Repository<Drug>,
    private safetyAlertService: SafetyAlertService,
  ) {}

  async addInventoryItem(
    createInventoryDto: CreateInventoryItemDto,
  ): Promise<InventoryItem> {
    const drug = await this.drugRepository.findOne({
      where: { id: createInventoryDto.drugId },
    });

    if (!drug) {
      throw new NotFoundException('Drug not found');
    }

    const inventoryItem = this.inventoryRepository.create(createInventoryDto);
    return await this.inventoryRepository.save(inventoryItem);
  }

  async updateInventory(
    id: string,
    updateDto: UpdateInventoryDto,
  ): Promise<InventoryItem> {
    const item = await this.inventoryRepository.findOne({
      where: { id },
      relations: ['drug'],
    });

    if (!item) {
      throw new NotFoundException('Inventory item not found');
    }

    Object.assign(item, updateDto);
    const updatedItem = await this.inventoryRepository.save(item);

    // Check for low stock after update
    if (updatedItem.quantity <= updatedItem.reorderLevel) {
      await this.safetyAlertService.createLowStockAlert(updatedItem);
    }

    return updatedItem;
  }

  async getInventoryByDrug(drugId: string): Promise<InventoryItem[]> {
    return await this.inventoryRepository.find({
      where: { drugId, isActive: true },
      relations: ['drug'],
      order: { expirationDate: 'ASC' },
    });
  }

  async getAllInventory(): Promise<InventoryItem[]> {
    return await this.inventoryRepository.find({
      where: { isActive: true },
      relations: ['drug'],
      order: { createdAt: 'DESC' },
    });
  }

  async getLowStockItems(): Promise<InventoryItem[]> {
    return await this.inventoryRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.drug', 'drug')
      .where('item.quantity <= item.reorderLevel')
      .andWhere('item.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async getExpiringItems(daysAhead: number = 30): Promise<InventoryItem[]> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysAhead);

    return await this.inventoryRepository.find({
      where: {
        expirationDate: LessThanOrEqual(expirationDate),
        isActive: true,
      },
      relations: ['drug'],
      order: { expirationDate: 'ASC' },
    });
  }

  async reserveStock(drugId: string, quantity: number): Promise<boolean> {
    const items = await this.getInventoryByDrug(drugId);
    let remainingQuantity = quantity;

    for (const item of items) {
      if (remainingQuantity <= 0) break;

      const availableQuantity = Math.min(item.quantity, remainingQuantity);
      item.quantity -= availableQuantity;
      remainingQuantity -= availableQuantity;

      await this.inventoryRepository.save(item);

      if (item.quantity <= item.reorderLevel) {
        await this.safetyAlertService.createLowStockAlert(item);
      }
    }

    return remainingQuantity === 0;
  }

  async checkAvailability(drugId: string, quantity: number): Promise<boolean> {
    const items = await this.getInventoryByDrug(drugId);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    return totalQuantity >= quantity;
  }
}
