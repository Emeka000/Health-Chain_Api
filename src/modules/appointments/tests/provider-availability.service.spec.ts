import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { ProviderAvailabilityService } from '../services/provider-availability.service';
import { ProviderAvailability } from '../entities/provider-availability.entity';
import { CreateProviderAvailabilityDto } from '../dto/create-provider-availability.dto';
import { UpdateProviderAvailabilityDto } from '../dto/update-provider-availability.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;
const createMockRepository = <T = any>(): MockRepository<T> => ({
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

describe('ProviderAvailabilityService', () => {
  let service: ProviderAvailabilityService;
  let providerAvailabilityRepository: MockRepository<ProviderAvailability>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderAvailabilityService,
        {
          provide: getRepositoryToken(ProviderAvailability),
          useValue: createMockRepository(),
        },
      ],
    }).compile();

    service = module.get<ProviderAvailabilityService>(
      ProviderAvailabilityService,
    );
    providerAvailabilityRepository = module.get<MockRepository>(
      getRepositoryToken(ProviderAvailability),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create provider availability successfully', async () => {
      const createProviderAvailabilityDto: CreateProviderAvailabilityDto = {
        providerId: 'provider-id',
        startDateTime: '2025-06-10T09:00:00Z',
        endDateTime: '2025-06-10T17:00:00Z',
        isAvailable: true,
        isTelemedicineAvailable: true,
        specialtiesAvailable: ['Cardiology', 'Internal Medicine'],
        recurrencePattern: 'WEEKLY',
        recurrenceEndDate: '2025-07-10T17:00:00Z',
      };

      const expectedAvailability = {
        id: 'availability-id',
        providerId: 'provider-id',
        startDateTime: new Date('2025-06-10T09:00:00Z'),
        endDateTime: new Date('2025-06-10T17:00:00Z'),
        isAvailable: true,
        isTelemedicineAvailable: true,
        specialtiesAvailable: ['Cardiology', 'Internal Medicine'],
        recurrencePattern: 'WEEKLY',
        recurrenceEndDate: new Date('2025-07-10T17:00:00Z'),
      };

      providerAvailabilityRepository.create.mockReturnValue(
        expectedAvailability,
      );
      providerAvailabilityRepository.save.mockResolvedValue(
        expectedAvailability,
      );
      providerAvailabilityRepository.find.mockResolvedValue([]); // No overlapping availabilities

      const result = await service.create(createProviderAvailabilityDto);

      expect(providerAvailabilityRepository.create).toHaveBeenCalled();
      expect(providerAvailabilityRepository.save).toHaveBeenCalledWith(
        expectedAvailability,
      );
      expect(result).toEqual(expectedAvailability);
    });

    it('should handle overlapping availabilities', async () => {
      const createProviderAvailabilityDto: CreateProviderAvailabilityDto = {
        providerId: 'provider-id',
        startDateTime: '2025-06-10T09:00:00Z',
        endDateTime: '2025-06-10T17:00:00Z',
        isAvailable: true,
        isTelemedicineAvailable: true,
        specialtiesAvailable: ['Cardiology'],
      };

      // Mock finding an overlapping availability
      providerAvailabilityRepository.find.mockResolvedValue([
        {
          id: 'existing-availability',
          providerId: 'provider-id',
          startDateTime: new Date('2025-06-10T08:00:00Z'),
          endDateTime: new Date('2025-06-10T12:00:00Z'),
        },
      ]);

      // Service should still create the availability despite overlap
      const expectedAvailability = {
        id: 'availability-id',
        ...createProviderAvailabilityDto,
        startDateTime: new Date(createProviderAvailabilityDto.startDateTime),
        endDateTime: new Date(createProviderAvailabilityDto.endDateTime),
      };

      providerAvailabilityRepository.create.mockReturnValue(
        expectedAvailability,
      );
      providerAvailabilityRepository.save.mockResolvedValue(
        expectedAvailability,
      );

      const result = await service.create(createProviderAvailabilityDto);

      expect(providerAvailabilityRepository.find).toHaveBeenCalled();
      expect(providerAvailabilityRepository.create).toHaveBeenCalled();
      expect(providerAvailabilityRepository.save).toHaveBeenCalled();
      expect(result).toEqual(expectedAvailability);
    });
  });

  describe('findAll', () => {
    it('should return all provider availabilities when no filters are provided', async () => {
      const expectedAvailabilities = [
        { id: 'availability-1' },
        { id: 'availability-2' },
      ];

      providerAvailabilityRepository.find.mockResolvedValue(
        expectedAvailabilities,
      );

      const result = await service.findAll({});

      expect(providerAvailabilityRepository.find).toHaveBeenCalledWith({
        where: {},
        order: { startDateTime: 'ASC' },
      });
      expect(result).toEqual(expectedAvailabilities);
    });

    it('should apply filters when provided', async () => {
      const filters = {
        providerId: 'provider-id',
        isAvailable: true,
        isTelemedicineAvailable: true,
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-06-30'),
      };

      const expectedAvailabilities = [{ id: 'availability-1' }];

      providerAvailabilityRepository.find.mockResolvedValue(
        expectedAvailabilities,
      );

      const result = await service.findAll(filters);

      expect(providerAvailabilityRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expectedAvailabilities);
    });
  });

  describe('findOne', () => {
    it('should return a provider availability when it exists', async () => {
      const availabilityId = 'availability-id';
      const expectedAvailability = { id: availabilityId };

      providerAvailabilityRepository.findOne.mockResolvedValue(
        expectedAvailability,
      );

      const result = await service.findOne(availabilityId);

      expect(providerAvailabilityRepository.findOne).toHaveBeenCalledWith({
        where: { id: availabilityId },
      });
      expect(result).toEqual(expectedAvailability);
    });

    it('should throw NotFoundException when provider availability does not exist', async () => {
      const availabilityId = 'non-existent-id';

      providerAvailabilityRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(availabilityId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update provider availability successfully', async () => {
      const availabilityId = 'availability-id';
      const updateProviderAvailabilityDto: UpdateProviderAvailabilityDto = {
        isAvailable: false,
        specialtiesAvailable: ['Neurology'],
      };

      const existingAvailability = {
        id: availabilityId,
        providerId: 'provider-id',
        startDateTime: new Date('2025-06-10T09:00:00Z'),
        endDateTime: new Date('2025-06-10T17:00:00Z'),
        isAvailable: true,
        specialtiesAvailable: ['Cardiology'],
      };

      const updatedAvailability = {
        ...existingAvailability,
        ...updateProviderAvailabilityDto,
      };

      providerAvailabilityRepository.findOne.mockResolvedValue(
        existingAvailability,
      );
      providerAvailabilityRepository.save.mockResolvedValue(
        updatedAvailability,
      );

      const result = await service.update(
        availabilityId,
        updateProviderAvailabilityDto,
      );

      expect(providerAvailabilityRepository.findOne).toHaveBeenCalledWith({
        where: { id: availabilityId },
      });
      expect(providerAvailabilityRepository.save).toHaveBeenCalledWith({
        ...existingAvailability,
        ...updateProviderAvailabilityDto,
      });
      expect(result).toEqual(updatedAvailability);
    });

    it('should throw NotFoundException when provider availability does not exist', async () => {
      const availabilityId = 'non-existent-id';
      const updateProviderAvailabilityDto: UpdateProviderAvailabilityDto = {
        isAvailable: false,
      };

      providerAvailabilityRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(availabilityId, updateProviderAvailabilityDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove provider availability successfully', async () => {
      const availabilityId = 'availability-id';
      const existingAvailability = { id: availabilityId };

      providerAvailabilityRepository.findOne.mockResolvedValue(
        existingAvailability,
      );
      providerAvailabilityRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(availabilityId);

      expect(providerAvailabilityRepository.findOne).toHaveBeenCalledWith({
        where: { id: availabilityId },
      });
      expect(providerAvailabilityRepository.delete).toHaveBeenCalledWith(
        availabilityId,
      );
    });

    it('should throw NotFoundException when provider availability does not exist', async () => {
      const availabilityId = 'non-existent-id';

      providerAvailabilityRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(availabilityId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('checkProviderAvailability', () => {
    it('should return true when provider is available', async () => {
      const providerId = 'provider-id';
      const startDateTime = new Date('2025-06-10T10:00:00Z');
      const endDateTime = new Date('2025-06-10T11:00:00Z');

      providerAvailabilityRepository.find.mockResolvedValue([
        {
          id: 'availability-id',
          providerId,
          startDateTime: new Date('2025-06-10T09:00:00Z'),
          endDateTime: new Date('2025-06-10T17:00:00Z'),
          isAvailable: true,
        },
      ]);

      const result = await service.checkProviderAvailability(
        providerId,
        startDateTime,
        endDateTime,
      );

      expect(providerAvailabilityRepository.find).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when provider is not available', async () => {
      const providerId = 'provider-id';
      const startDateTime = new Date('2025-06-10T10:00:00Z');
      const endDateTime = new Date('2025-06-10T11:00:00Z');

      // No availability records found
      providerAvailabilityRepository.find.mockResolvedValue([]);

      const result = await service.checkProviderAvailability(
        providerId,
        startDateTime,
        endDateTime,
      );

      expect(providerAvailabilityRepository.find).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should return false when provider has availability but marked as not available', async () => {
      const providerId = 'provider-id';
      const startDateTime = new Date('2025-06-10T10:00:00Z');
      const endDateTime = new Date('2025-06-10T11:00:00Z');

      providerAvailabilityRepository.find.mockResolvedValue([
        {
          id: 'availability-id',
          providerId,
          startDateTime: new Date('2025-06-10T09:00:00Z'),
          endDateTime: new Date('2025-06-10T17:00:00Z'),
          isAvailable: false, // Not available
        },
      ]);

      const result = await service.checkProviderAvailability(
        providerId,
        startDateTime,
        endDateTime,
      );

      expect(providerAvailabilityRepository.find).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('findAvailableProvidersBySpecialty', () => {
    it('should return providers available for a specialty', async () => {
      const specialty = 'Cardiology';
      const startDate = new Date('2025-06-10T09:00:00Z');
      const endDate = new Date('2025-06-10T17:00:00Z');
      const isTelemedicine = true;

      const expectedAvailabilities = [
        {
          id: 'availability-1',
          providerId: 'provider-1',
          specialtiesAvailable: ['Cardiology', 'Internal Medicine'],
          isTelemedicineAvailable: true,
        },
        {
          id: 'availability-2',
          providerId: 'provider-2',
          specialtiesAvailable: ['Cardiology'],
          isTelemedicineAvailable: true,
        },
      ];

      providerAvailabilityRepository.find.mockResolvedValue(
        expectedAvailabilities,
      );

      const result = await service.findAvailableProvidersBySpecialty(
        specialty,
        startDate,
        endDate,
        isTelemedicine,
      );

      expect(providerAvailabilityRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expectedAvailabilities);
    });

    it('should filter by telemedicine when requested', async () => {
      const specialty = 'Cardiology';
      const startDate = new Date('2025-06-10T09:00:00Z');
      const endDate = new Date('2025-06-10T17:00:00Z');
      const isTelemedicine = true;

      const availabilities = [
        {
          id: 'availability-1',
          providerId: 'provider-1',
          specialtiesAvailable: ['Cardiology'],
          isTelemedicineAvailable: true,
        },
        {
          id: 'availability-2',
          providerId: 'provider-2',
          specialtiesAvailable: ['Cardiology'],
          isTelemedicineAvailable: false, // Not available for telemedicine
        },
      ];

      providerAvailabilityRepository.find.mockResolvedValue(availabilities);

      const result = await service.findAvailableProvidersBySpecialty(
        specialty,
        startDate,
        endDate,
        isTelemedicine,
      );

      expect(providerAvailabilityRepository.find).toHaveBeenCalled();
      // Should only return the first availability that supports telemedicine
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('availability-1');
    });
  });
});
