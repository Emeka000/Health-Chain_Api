import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PharmacysService } from './pharmacys.service';
import { CreatePharmacyDto } from './dto/create-pharmacy.dto';
import { UpdatePharmacyDto } from './dto/update-pharmacy.dto';

@Controller('pharmacys')
export class PharmacysController {
  constructor(private readonly pharmacysService: PharmacysService) {}

  @Post()
  create(@Body() createPharmacyDto: CreatePharmacyDto) {
    return this.pharmacysService.create(createPharmacyDto);
  }

  @Get()
  findAll() {
    return this.pharmacysService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pharmacysService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePharmacyDto: UpdatePharmacyDto) {
    return this.pharmacysService.update(+id, updatePharmacyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pharmacysService.remove(+id);
  }
}
