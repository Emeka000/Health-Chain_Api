import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { RoomService } from './room.service';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  create(@Body() data: any) {
    return this.roomService.create(data);
  }

  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) {
    return this.roomService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomService.remove(id);
  }

  @Get(':id/beds')
  getBeds(@Param('id') id: string) {
    return this.roomService.getBeds(id);
  }
}
