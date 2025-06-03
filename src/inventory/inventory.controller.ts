import InventoryService from './inventory.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('low-stock')
  getLowStockDrugs() {
    return this.inventoryService.checkLowStock();
  }

  @Get('expiring')
  getExpiringDrugs() {
    return this.inventoryService.findExpiringDrugs(7);
  }

  @Post()
  addDrug(@Body() dto: any) {
    return this.inventoryService.addDrug(dto);
  }
}
