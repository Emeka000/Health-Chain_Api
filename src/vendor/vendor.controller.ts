import { Controller, Post, Body, Get } from '@nestjs/common';
import { VendorService } from './vendor.service';
import { CreateVendorDto } from './dto/create-vendor.dto';

@Controller('vendors')
export class VendorController {
  constructor(private readonly vendorService: VendorService) {}

  @Post()
  createVendor(@Body() body: CreateVendorDto) {
    return this.vendorService.createVendor(body);
  }

  @Get()
  getAll() {
    return this.vendorService.getAll();
  }
}
