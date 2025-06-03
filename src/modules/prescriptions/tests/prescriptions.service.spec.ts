import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PrescriptionsService } from '../services/prescriptions.service';
import { DrugInteractionService } from '../services/drug-interaction.service';
import { Prescription } from '../entities/prescription.entity';
import { CreatePrescriptionDto } from '../dto/create-prescription.dto';
import { UpdatePrescriptionDto } from '../dto/update-prescription.dto';
import { PrescriptionStatus } from '../enums/prescription-status.enum';
import { MedicationRoute } from '../enums/medication-route.enum';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// Remove generic type parameter to avoid ObjectLiteral constraint issues
type MockRepository = Partial<Record<keyof Repository<any>, jest.Mock>> & { create: jest.Mock; save: jest.Mock; find: jest.Mock; findOne: jest.Mock; remove: jest.Mock };
type MockDrugInteractionService = Partial<Record<keyof DrugInteractionService, jest.Mock>> & { checkInteractions: jest.Mock };

const createMockRepository = (): MockRepository => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

const createMockDrugInteractionService = (): MockDrugInteractionService => ({
  checkInteractions: jest.fn(),
});

describe('PrescriptionsService', () => {
  let service: PrescriptionsService;
  let prescriptionRepository: MockRepository;
  let drugInteractionService: MockDrugInteractionService;

  beforeEach(async () => {
    prescriptionRepository = createMockRepository();
    drugInteractionService = createMockDrugInteractionService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrescriptionsService,
        {
          provide: getRepositoryToken(Prescription),
          useValue: prescriptionRepository,
        },
        {
          provide: DrugInteractionService,
          useValue: drugInteractionService,
        },
      ],
    }).compile();

    service = module.get<PrescriptionsService>(PrescriptionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a prescription when no severe interactions exist', async () => {
      // Arrange
      const createPrescriptionDto: CreatePrescriptionDto = {
        patientId: '123',
        prescribingProviderId: '456',
        medicationName: 'Test Medication',
        strength: '10mg',
        dosageForm: 'tablet',
        quantity: 30,
        quantityUnit: 'tablets',
        route: MedicationRoute.ORAL,
        frequency: 'once daily',
        createdBy: '456',
      };

      const prescription = {
        id: '789',
        ...createPrescriptionDto,
        status: PrescriptionStatus.PENDING_APPROVAL,
        refillsRemaining: 0,
        contraindicationsChecked: true,
      };

      drugInteractionService.checkInteractions.mockResolvedValue({
        hasSevereInteractions: false,
        alerts: [],
      });

      prescriptionRepository.create.mockReturnValue(prescription);
      prescriptionRepository.save.mockResolvedValue(prescription);

      // Act
      const result = await service.create(createPrescriptionDto);

      // Assert
      expect(drugInteractionService.checkInteractions).toHaveBeenCalledWith(
        createPrescriptionDto.patientId,
        createPrescriptionDto.medicationName,
        createPrescriptionDto.medicationId,
      );
      expect(prescriptionRepository.create).toHaveBeenCalledWith({
        ...createPrescriptionDto,
        status: PrescriptionStatus.PENDING_APPROVAL,
        refillsRemaining: 0,
        contraindicationsChecked: true,
      });
      expect(prescriptionRepository.save).toHaveBeenCalledWith(prescription);
      expect(result).toEqual(prescription);
    });

    it('should throw BadRequestException when severe interactions exist', async () => {
      // Arrange
      const createPrescriptionDto: CreatePrescriptionDto = {
        patientId: '123',
        prescribingProviderId: '456',
        medicationName: 'Test Medication',
        strength: '10mg',
        dosageForm: 'tablet',
        quantity: 30,
        quantityUnit: 'tablets',
        route: MedicationRoute.ORAL,
        frequency: 'once daily',
        createdBy: '456',
      };

      drugInteractionService.checkInteractions.mockResolvedValue({
        hasSevereInteractions: true,
        alerts: [{ id: '1', description: 'Severe interaction' }],
      });

      // Act & Assert
      await expect(service.create(createPrescriptionDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of prescriptions', async () => {
      // Arrange
      const prescriptions = [
        { id: '1', medicationName: 'Med 1' },
        { id: '2', medicationName: 'Med 2' },
      ];
      prescriptionRepository.find.mockResolvedValue(prescriptions);

      // Act
      const result = await service.findAll();

      // Assert
      expect(prescriptionRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: ['patient', 'prescribingProvider', 'medication', 'pharmacy'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(prescriptions);
    });

    it('should apply filters when provided', async () => {
      // Arrange
      const filters = { patientId: '123', status: PrescriptionStatus.ACTIVE };
      const prescriptions = [{ id: '1', medicationName: 'Med 1' }];
      prescriptionRepository.find.mockResolvedValue(prescriptions);

      // Act
      const result = await service.findAll(filters);

      // Assert
      expect(prescriptionRepository.find).toHaveBeenCalledWith({
        where: filters,
        relations: ['patient', 'prescribingProvider', 'medication', 'pharmacy'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(prescriptions);
    });
  });

  describe('findOne', () => {
    it('should return a prescription when found', async () => {
      // Arrange
      const prescription = { id: '1', medicationName: 'Med 1' };
      prescriptionRepository.findOne.mockResolvedValue(prescription);

      // Act
      const result = await service.findOne('1');

      // Assert
      expect(prescriptionRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['patient', 'prescribingProvider', 'medication', 'pharmacy', 'administrations'],
      });
      expect(result).toEqual(prescription);
    });

    it('should throw NotFoundException when prescription not found', async () => {
      // Arrange
      prescriptionRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a prescription when no status change to ACTIVE', async () => {
      // Arrange
      const prescription = {
        id: '1',
        medicationName: 'Med 1',
        status: PrescriptionStatus.PENDING_APPROVAL,
        patientId: '123',
      };
      const updatePrescriptionDto: UpdatePrescriptionDto = {
        notes: 'Updated notes',
        updatedBy: 'user-123',
      };
      const updatedPrescription = { ...prescription, ...updatePrescriptionDto };

      prescriptionRepository.findOne.mockResolvedValue(prescription);
      prescriptionRepository.save.mockResolvedValue(updatedPrescription);

      // Act
      const result = await service.update('1', updatePrescriptionDto);

      // Assert
      expect(prescriptionRepository.findOne).toHaveBeenCalled();
      expect(prescriptionRepository.save).toHaveBeenCalledWith({
        ...prescription,
        ...updatePrescriptionDto,
      });
      expect(result).toEqual(updatedPrescription);
    });

    it('should check interactions when status changes to ACTIVE', async () => {
      // Arrange
      const prescription = {
        id: '1',
        medicationName: 'Med 1',
        status: PrescriptionStatus.PENDING_APPROVAL,
        patientId: '123',
        medicationId: 'med-1',
      };
      const updatePrescriptionDto: UpdatePrescriptionDto = {
        status: PrescriptionStatus.ACTIVE,
        updatedBy: 'user-123',
      };
      const updatedPrescription = { ...prescription, ...updatePrescriptionDto };

      prescriptionRepository.findOne.mockResolvedValue(prescription);
      prescriptionRepository.save.mockResolvedValue(updatedPrescription);
      drugInteractionService.checkInteractions.mockResolvedValue({
        hasSevereInteractions: false,
        alerts: [],
      });

      // Act
      const result = await service.update('1', updatePrescriptionDto);

      // Assert
      expect(drugInteractionService.checkInteractions).toHaveBeenCalledWith(
        prescription.patientId,
        prescription.medicationName,
        prescription.medicationId,
      );
      expect(prescriptionRepository.save).toHaveBeenCalledWith({
        ...prescription,
        ...updatePrescriptionDto,
      });
      expect(result).toEqual(updatedPrescription);
    });

    it('should throw BadRequestException when changing to ACTIVE with severe interactions', async () => {
      // Arrange
      const prescription = {
        id: '1',
        medicationName: 'Med 1',
        status: PrescriptionStatus.PENDING_APPROVAL,
        patientId: '123',
        medicationId: 'med-1',
      };
      const updatePrescriptionDto: UpdatePrescriptionDto = {
        status: PrescriptionStatus.ACTIVE,
        updatedBy: 'user-123',
      };

      prescriptionRepository.findOne.mockResolvedValue(prescription);
      drugInteractionService.checkInteractions.mockResolvedValue({
        hasSevereInteractions: true,
        alerts: [{ id: '1', description: 'Severe interaction' }],
      });

      // Act & Assert
      await expect(service.update('1', updatePrescriptionDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('approve', () => {
    it('should approve a pending prescription', async () => {
      // Arrange
      const prescription = {
        id: '1',
        status: PrescriptionStatus.PENDING_APPROVAL,
      };
      const pharmacistId = 'pharm-123';
      const approvedPrescription = {
        ...prescription,
        status: PrescriptionStatus.ACTIVE,
        authorizingPharmacistId: pharmacistId,
        verificationTimestamp: expect.any(Date),
      };

      prescriptionRepository.findOne.mockResolvedValue(prescription);
      prescriptionRepository.save.mockResolvedValue(approvedPrescription);

      // Act
      const result = await service.approve('1', pharmacistId);

      // Assert
      expect(prescriptionRepository.save).toHaveBeenCalledWith({
        ...prescription,
        status: PrescriptionStatus.ACTIVE,
        authorizingPharmacistId: pharmacistId,
        verificationTimestamp: expect.any(Date),
      });
      expect(result).toEqual(approvedPrescription);
    });

    it('should throw BadRequestException when approving a non-pending prescription', async () => {
      // Arrange
      const prescription = {
        id: '1',
        status: PrescriptionStatus.ACTIVE,
      };
      const pharmacistId = 'pharm-123';

      prescriptionRepository.findOne.mockResolvedValue(prescription);

      // Act & Assert
      await expect(service.approve('1', pharmacistId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancel', () => {
    it('should cancel an active prescription', async () => {
      // Arrange
      const prescription = {
        id: '1',
        status: PrescriptionStatus.ACTIVE,
      };
      const reason = 'No longer needed';
      const updatedBy = 'user-123';
      const cancelledPrescription = {
        ...prescription,
        status: PrescriptionStatus.CANCELLED,
        cancellationReason: reason,
        updatedBy,
      };

      prescriptionRepository.findOne.mockResolvedValue(prescription);
      prescriptionRepository.save.mockResolvedValue(cancelledPrescription);

      // Act
      const result = await service.cancel('1', reason, updatedBy);

      // Assert
      expect(prescriptionRepository.save).toHaveBeenCalledWith({
        ...prescription,
        status: PrescriptionStatus.CANCELLED,
        cancellationReason: reason,
        updatedBy,
      });
      expect(result).toEqual(cancelledPrescription);
    });

    it('should throw BadRequestException when cancelling an already cancelled prescription', async () => {
      // Arrange
      const prescription = {
        id: '1',
        status: PrescriptionStatus.CANCELLED,
      };
      const reason = 'No longer needed';
      const updatedBy = 'user-123';

      prescriptionRepository.findOne.mockResolvedValue(prescription);

      // Act & Assert
      await expect(service.cancel('1', reason, updatedBy)).rejects.toThrow(BadRequestException);
    });
  });

  describe('refill', () => {
    it('should refill an active prescription with remaining refills', async () => {
      // Arrange
      const prescription = {
        id: '1',
        status: PrescriptionStatus.ACTIVE,
        refillsRemaining: 2,
      };
      const updatedBy = 'user-123';
      const refilledPrescription = {
        ...prescription,
        refillsRemaining: 1,
        updatedBy,
      };

      prescriptionRepository.findOne.mockResolvedValue(prescription);
      prescriptionRepository.save.mockResolvedValue(refilledPrescription);

      // Act
      const result = await service.refill('1', updatedBy);

      // Assert
      expect(prescriptionRepository.save).toHaveBeenCalledWith({
        ...prescription,
        refillsRemaining: 1,
        updatedBy,
      });
      expect(result).toEqual(refilledPrescription);
    });

    it('should throw BadRequestException when refilling a non-active prescription', async () => {
      // Arrange
      const prescription = {
        id: '1',
        status: PrescriptionStatus.CANCELLED,
        refillsRemaining: 2,
      };
      const updatedBy = 'user-123';

      prescriptionRepository.findOne.mockResolvedValue(prescription);

      // Act & Assert
      await expect(service.refill('1', updatedBy)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when no refills remaining', async () => {
      // Arrange
      const prescription = {
        id: '1',
        status: PrescriptionStatus.ACTIVE,
        refillsRemaining: 0,
      };
      const updatedBy = 'user-123';

      prescriptionRepository.findOne.mockResolvedValue(prescription);

      // Act & Assert
      await expect(service.refill('1', updatedBy)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a prescription', async () => {
      // Arrange
      const prescription = { id: '1', medicationName: 'Med 1' };
      prescriptionRepository.findOne.mockResolvedValue(prescription);
      prescriptionRepository.remove.mockResolvedValue(undefined);

      // Act
      await service.remove('1');

      // Assert
      expect(prescriptionRepository.findOne).toHaveBeenCalled();
      expect(prescriptionRepository.remove).toHaveBeenCalledWith(prescription);
    });
  });
});
