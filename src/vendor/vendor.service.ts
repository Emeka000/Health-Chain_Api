import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendor } from './vendor.entity';
import { CreateVendorDto } from './dto/create-vendor.dto';

@Injectable()
export class VendorService {
  constructor(
    @InjectRepository(Vendor)
    private readonly repo: Repository<Vendor>,
  ) {}

  async createVendor(body: CreateVendorDto) {
    const vendor = this.repo.create(body);
    return this.repo.save(vendor);
  }

  async getAll() {
    return this.repo.find({ relations: ['drugs'] });
  }
}
