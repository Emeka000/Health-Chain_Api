import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { SurgicalCaseService } from './surgical-case.service';
import { CreateSurgicalCaseDto } from './dto/create-surgical-case.dto';
import { UpdateSurgicalCaseDto } from './dto/update-surgical-case.dto';

@Controller('surgical-cases')
export class SurgicalCaseController {
  constructor(private readonly surgicalCaseService: SurgicalCaseService) {}

  @Post()
  create(@Body() dto: CreateSurgicalCaseDto) {
    return this.surgicalCaseService.create(dto);
  }

  @Get()
  findAll() {
    return this.surgicalCaseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.surgicalCaseService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSurgicalCaseDto) {
    return this.surgicalCaseService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.surgicalCaseService.remove(id);
  }
}
