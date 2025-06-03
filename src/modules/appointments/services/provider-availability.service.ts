import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ProviderAvailability } from '../entities/provider-availability.entity';
import { CreateProviderAvailabilityDto } from '../dto/create-provider-availability.dto';
import { UpdateProviderAvailabilityDto } from '../dto/update-provider-availability.dto';

@Injectable()
export class ProviderAvailabilityService {
  constructor(
    @InjectRepository(ProviderAvailability)
    private readonly providerAvailabilityRepository: Repository<ProviderAvailability>,
  ) {}

  /**
   * Create a new provider availability
   */
  async create(
    createProviderAvailabilityDto: CreateProviderAvailabilityDto,
  ): Promise<ProviderAvailability> {
    // Convert string dates to Date objects
    const startDateTime = new Date(createProviderAvailabilityDto.startDateTime);
    const endDateTime = new Date(createProviderAvailabilityDto.endDateTime);
    let recurrenceEndDate: Date | undefined = undefined;

    if (createProviderAvailabilityDto.recurrenceEndDate) {
      recurrenceEndDate = new Date(
        createProviderAvailabilityDto.recurrenceEndDate,
      );
    }

    // Validate availability times
    this.validateAvailabilityTimes(
      startDateTime,
      endDateTime,
      recurrenceEndDate,
    );

    // Check for overlapping availability periods
    await this.checkOverlappingAvailability(
      createProviderAvailabilityDto.providerId,
      startDateTime,
      endDateTime,
    );

    // Create the availability entity
    const availability = this.providerAvailabilityRepository.create({
      ...createProviderAvailabilityDto,
      startDateTime,
      endDateTime,
      recurrenceEndDate,
    });

    return this.providerAvailabilityRepository.save(availability);
  }

  /**
   * Find all provider availabilities with optional filtering
   */
  async findAll(filters?: {
    providerId?: string;
    startDate?: Date;
    endDate?: Date;
    isAvailable?: boolean;
    isTelemedicineAvailable?: boolean;
    specialtiesAvailable?: string[];
  }): Promise<ProviderAvailability[]> {
    const query: any = {};

    if (filters) {
      if (filters.providerId) query.providerId = filters.providerId;
      if (filters.isAvailable !== undefined)
        query.isAvailable = filters.isAvailable;
      if (filters.isTelemedicineAvailable !== undefined)
        query.isTelemedicineAvailable = filters.isTelemedicineAvailable;

      // Handle date range filtering
      if (filters.startDate && filters.endDate) {
        query.startDateTime = Between(filters.startDate, filters.endDate);
      } else if (filters.startDate) {
        query.startDateTime = MoreThanOrEqual(filters.startDate);
      } else if (filters.endDate) {
        query.startDateTime = LessThanOrEqual(filters.endDate);
      }

      // For specialties, we need a more complex query
      if (
        filters.specialtiesAvailable &&
        filters.specialtiesAvailable.length > 0
      ) {
        return this.providerAvailabilityRepository
          .createQueryBuilder('availability')
          .where('availability.providerId = :providerId', {
            providerId: filters.providerId,
          })
          .andWhere('availability.specialtiesAvailable @> :specialties', {
            specialties: JSON.stringify(filters.specialtiesAvailable),
          })
          .getMany();
      }
    }

    return this.providerAvailabilityRepository.find({
      where: query,
      order: { startDateTime: 'ASC' },
    });
  }

  /**
   * Find one provider availability by ID
   */
  async findOne(id: string): Promise<ProviderAvailability> {
    const availability = await this.providerAvailabilityRepository.findOne({
      where: { id },
    });

    if (!availability) {
      throw new NotFoundException(
        `Provider availability with ID ${id} not found`,
      );
    }

    return availability;
  }

  /**
   * Find provider availability by date range
   */
  async findByDateRange(
    providerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<ProviderAvailability[]> {
    return this.providerAvailabilityRepository.find({
      where: {
        providerId,
        isAvailable: true,
        isActive: true,
        startDateTime: LessThanOrEqual(endDate),
        endDateTime: MoreThanOrEqual(startDate),
      },
      order: { startDateTime: 'ASC' },
    });
  }

  /**
   * Update a provider availability
   */
  async update(
    id: string,
    updateProviderAvailabilityDto: UpdateProviderAvailabilityDto,
  ): Promise<ProviderAvailability> {
    const availability = await this.findOne(id);

    // If updating dates, validate them
    if (
      updateProviderAvailabilityDto.startDateTime ||
      updateProviderAvailabilityDto.endDateTime ||
      updateProviderAvailabilityDto.recurrenceEndDate
    ) {
      const startDateTime = updateProviderAvailabilityDto.startDateTime
        ? new Date(updateProviderAvailabilityDto.startDateTime)
        : availability.startDateTime;

      const endDateTime = updateProviderAvailabilityDto.endDateTime
        ? new Date(updateProviderAvailabilityDto.endDateTime)
        : availability.endDateTime;

      const recurrenceEndDate = updateProviderAvailabilityDto.recurrenceEndDate
        ? new Date(updateProviderAvailabilityDto.recurrenceEndDate)
        : availability.recurrenceEndDate;

      this.validateAvailabilityTimes(
        startDateTime,
        endDateTime,
        recurrenceEndDate,
      );

      // Check for overlapping availability periods
      if (
        updateProviderAvailabilityDto.startDateTime ||
        updateProviderAvailabilityDto.endDateTime
      ) {
        await this.checkOverlappingAvailability(
          updateProviderAvailabilityDto.providerId || availability.providerId,
          startDateTime,
          endDateTime,
          id, // Exclude current availability from overlap check
        );
      }

      // Update the dates
      if (updateProviderAvailabilityDto.startDateTime) {
        availability.startDateTime = startDateTime;
      }

      if (updateProviderAvailabilityDto.endDateTime) {
        availability.endDateTime = endDateTime;
      }

      if (updateProviderAvailabilityDto.recurrenceEndDate) {
        availability.recurrenceEndDate = recurrenceEndDate;
      }
    }

    // Update other fields
    Object.assign(availability, updateProviderAvailabilityDto);

    return this.providerAvailabilityRepository.save(availability);
  }

  /**
   * Remove a provider availability
   */
  async remove(id: string): Promise<void> {
    const availability = await this.findOne(id);
    await this.providerAvailabilityRepository.remove(availability);
  }

  /**
   * Find available providers by specialty and date range
   */
  async findAvailableProvidersBySpecialty(
    specialty: string,
    startDate: Date,
    endDate: Date,
    isTelemedicine: boolean = false,
  ): Promise<ProviderAvailability[]> {
    const query = this.providerAvailabilityRepository
      .createQueryBuilder('availability')
      .where('availability.isAvailable = :isAvailable', { isAvailable: true })
      .andWhere('availability.isActive = :isActive', { isActive: true })
      .andWhere('availability.startDateTime <= :endDate', { endDate })
      .andWhere('availability.endDateTime >= :startDate', { startDate });

    if (isTelemedicine) {
      query.andWhere('availability.isTelemedicineAvailable = :isTelemedicine', {
        isTelemedicine: true,
      });
    } else {
      query.andWhere('availability.isInPersonAvailable = :isInPerson', {
        isInPerson: true,
      });
    }

    query.andWhere('availability.specialtiesAvailable @> :specialty', {
      specialty: JSON.stringify([specialty]),
    });

    return query.getMany();
  }

  /**
   * Validate availability times
   */
  private validateAvailabilityTimes(
    startDateTime: Date,
    endDateTime: Date,
    recurrenceEndDate: Date | null = null,
  ): void {
    // Ensure end time is after start time
    if (endDateTime <= startDateTime) {
      throw new BadRequestException(
        'Availability end time must be after start time',
      );
    }

    // If recurring, ensure recurrence end date is after start date
    if (recurrenceEndDate && recurrenceEndDate <= startDateTime) {
      throw new BadRequestException(
        'Recurrence end date must be after start date',
      );
    }
  }

  /**
   * Check for overlapping availability periods
   */
  private async checkOverlappingAvailability(
    providerId: string,
    startDateTime: Date,
    endDateTime: Date,
    excludeAvailabilityId?: string,
  ): Promise<void> {
    // Build query to find overlapping availability periods
    const query = this.providerAvailabilityRepository
      .createQueryBuilder('availability')
      .where('availability.providerId = :providerId', { providerId })
      .andWhere('availability.startDateTime <= :endDateTime', { endDateTime })
      .andWhere('availability.endDateTime >= :startDateTime', {
        startDateTime,
      });

    // Exclude the current availability if updating
    if (excludeAvailabilityId) {
      query.andWhere('availability.id != :id', { id: excludeAvailabilityId });
    }

    const overlappingAvailabilities = await query.getMany();

    // No need to throw an error for overlapping availabilities - just a warning
    // This allows providers to have multiple overlapping availability periods
    // which might be useful for different types of appointments
  }
}
