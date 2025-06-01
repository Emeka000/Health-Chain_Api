import { Controller, Get, Post, Body, Param, Query, BadRequestException } from '@nestjs/common';
import { Drug } from '../entities/drug.entity';
import { DrugService, CreateDrugDto } from '../services/drug.service';

@Controller('drugs')
export class DrugController {
  constructor(private readonly drugService: DrugService) {}

  @Post()
  async create(@Body() createDrugDto: CreateDrugDto): Promise<Drug> {
    return await this.drugService.create(createDrugDto);
  }

  @Get()
  async findAll(): Promise<Drug[]> {
    return await this.drugService.findAll();
  }

  @Get('search')
  async search(@Query('q') query: string): Promise<Drug[]> {
    if (!query || query.trim().length < 2) {
      throw new BadRequestException('Search query must be at least 2 characters');
    }
    return await this.drugService.searchDrugs(query);
  }

  @Get('ndc/:ndcCode')
  async findByNdc(@Param('ndcCode') ndcCode: string): Promise<Drug> {
    return await this.drugService.findByNdc(ndcCode);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Drug> {
    return await this.drugService.findById(id);
  }

  @Post('check-interactions')
  async checkInteractions(@Body() body: { drugIds: string[] }): Promise<{ interactions: string[] }> {
    const interactions = await this.drugService.checkDrugInteractions(body.drugIds);
    return { interactions };
  }
}
