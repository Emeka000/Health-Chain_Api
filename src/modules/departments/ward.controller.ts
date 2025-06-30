import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { WardService } from './ward.service';

@Controller('wards')
export class WardController {
  constructor(private readonly wardService: WardService) {}

  @Post()
  create(@Body() data: any) {
    return this.wardService.create(data);
  }

  @Get()
  findAll() {
    return this.wardService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.wardService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.wardService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.wardService.remove(id);
  }

  @Get(':id/rooms')
  getRooms(@Param('id') id: string) {
    return this.wardService.getRooms(id);
  }
}
