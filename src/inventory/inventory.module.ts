import { Module } from '@nestjs/common';
// import { Inventory } from './inventory';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  providers: [InventoryService],
  controllers: [InventoryController],
})
export class InventoryModule {}
