import { Controller, Post, Body, Get } from '@nestjs/common';
import { WasteService } from './waste.service';
import { LogWasteDto } from './dto/log-waste.dto';

@Controller('waste')
export class WasteController {
  constructor(private readonly wasteService: WasteService) {}

  @Post()
  logWaste(@Body() body: LogWasteDto) {
    return this.wasteService.logWaste(body);
  }

  @Get()
  getAll() {
    return this.wasteService.getAll();
  }
}
