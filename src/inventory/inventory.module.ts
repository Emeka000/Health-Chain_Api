import { Module } from '@nestjs/common';
import { Inventory } from './inventory';
import { InventoryController } from './inventory.controller';

@Module({
  providers: [Inventory],
  controllers: [InventoryController]
})
export class InventoryModule {}
