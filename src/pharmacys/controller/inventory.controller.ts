import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { InventoryItem } from '../entities/inventory-item.entity';
import {
  InventoryService,
  CreateInventoryItemDto,
  UpdateInventoryDto,
} from '../services/inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post()
  async addItem(
    @Body() createDto: CreateInventoryItemDto,
  ): Promise<InventoryItem> {
    return await this.inventoryService.addInventoryItem(createDto);
  }

  @Get()
  async getAll(): Promise<InventoryItem[]> {
    return await this.inventoryService.getAllInventory();
  }

  @Get('drug/:drugId')
  async getByDrug(@Param('drugId') drugId: string): Promise<InventoryItem[]> {
    return await this.inventoryService.getInventoryByDrug(drugId);
  }

  @Get('low-stock')
  async getLowStock(): Promise<InventoryItem[]> {
    return await this.inventoryService.getLowStockItems();
  }

  @Get('expiring')
  async getExpiring(@Query('days') days?: string): Promise<InventoryItem[]> {
    const daysAhead = days ? parseInt(days) : 30;
    return await this.inventoryService.getExpiringItems(daysAhead);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInventoryDto,
  ): Promise<InventoryItem> {
    return await this.inventoryService.updateInventory(id, updateDto);
  }

  @Post('check-availability')
  async checkAvailability(
    @Body() body: { drugId: string; quantity: number },
  ): Promise<{ available: boolean }> {
    const available = await this.inventoryService.checkAvailability(
      body.drugId,
      body.quantity,
    );
    return { available };
  }
}
