import { Controller, Get, Query } from '@nestjs/common';
import { Icd10Service } from './icd10.service';

@Controller('icd10')
export class Icd10Controller {
  constructor(private readonly icd10Service: Icd10Service) {}

  @Get('search')
  search(@Query('q') query: string) {
    return this.icd10Service.search(query);
  }
}
