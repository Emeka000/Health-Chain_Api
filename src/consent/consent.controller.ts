import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { ConsentService } from './consent.service';
import { CreateConsentDto } from './dto/create-consent.dto';
import { UpdateConsentDto } from './dto/update-consent.dto';

@Controller('consents')
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Post()
  create(@Body() createConsentDto: CreateConsentDto) {
    return this.consentService.create(createConsentDto);
  }

  @Get()
  findAll() {
    return this.consentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.consentService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateConsentDto: UpdateConsentDto) {
    return this.consentService.update(+id, updateConsentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.consentService.remove(+id);
  }
}
