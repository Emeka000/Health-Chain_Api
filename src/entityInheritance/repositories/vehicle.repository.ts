import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle, Car, Motorcycle } from '../entities/class-table/vehicle.entity';
import { BaseInheritanceRepository } from './base-inheritance.repository';
import { InheritanceType } from '../decorators/inheritance.decorator';

@Injectable()
export class VehicleRepository extends BaseInheritanceRepository<Vehicle> {
  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Car)
    private carRepository: Repository<Car>,
    @InjectRepository(Motorcycle)
    private motorcycleRepository: Repository<Motorcycle>
  ) {
    super(vehicleRepository, InheritanceType.CLASS_TABLE);
  }

  async findAllCars(): Promise<Car[]> {
    return this.carRepository.find({
      relations: ['vehicle']
    });
  }

  async findAllMotorcycles(): Promise<Motorcycle[]> {
    return this.motorcycleRepository.find({
      relations: ['vehicle']
    });
  }

  async findCarsByFuelType(fuelType: string): Promise<Car[]> {
    return this.carRepository.find({
      where: { fuelType },
      relations: ['vehicle']
    });
  }

  async findMotorcyclesByType(motorcycleType: string): Promise<Motorcycle[]> {
    return this.motorcycleRepository.find({
      where: { motorcycleType },
      relations: ['vehicle']
    });
  }

  async findVehiclesByPriceRange(minPrice: number, maxPrice: number): Promise<Vehicle[]> {
    return this.vehicleRepository
      .createQueryBuilder('vehicle')
      .where('vehicle.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice })
      .getMany();
  }

  async getVehicleWithDetails(id: string): Promise<Car | Motorcycle | null> {
    // Try to find as car first
    const car = await this.carRepository.findOne({
      where: { id },
      relations: ['vehicle']
    });
    
    if (car) return car;
    
    // Try to find as motorcycle
    const motorcycle = await this.motorcycleRepository.findOne({
      where: { id },
      relations: ['vehicle']
    });
    
    return motorcycle;
  }
}

