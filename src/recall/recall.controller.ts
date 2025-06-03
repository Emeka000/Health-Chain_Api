import { Controller, Post, Body, Get } from '@nestjs/common';
import { RecallService } from './recall.service';
import { CreateRecallDto } from './dto/create-recall.dto';

@Controller('recalls')
export class RecallController {
  constructor(private readonly recallService: RecallService) {}

  @Post()
  createRecall(@Body() body: CreateRecallDto) {
    return this.recallService.createRecall(body);
  }

  @Get()
  getAll() {
    return this.recallService.getAll();
  }
}
