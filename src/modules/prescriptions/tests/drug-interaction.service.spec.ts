import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DrugInteractionService } from '../services/drug-interaction.service';
import { DrugInteractionAlert, AlertStatus, InteractionSeverity, InteractionType } from '../entities/drug-interaction-alert.entity';
import { PatientMedicationAllergy, AllergyStatus } from '../entities/patient-medication-allergy.entity';
import { Prescription } from '../entities/prescription.entity';
import { PrescriptionStatus } from '../enums/prescription-status.enum';

// Remove generic type parameter to avoid ObjectLiteral constraint issues
type MockRepository = Partial<Record<keyof Repository<any>, jest.Mock>> & { create: jest.Mock; save: jest.Mock; find: jest.Mock; findOne: jest.Mock; remove: jest.Mock };

const createMockRepository = (): MockRepository => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
});

describe('DrugInteractionService', () => {
  let service: DrugInteractionService;
  let alertRepository: MockRepository;
  let allergyRepository: MockRepository;
  let prescriptionRepository: MockRepository;

  beforeEach(async () => {
    alertRepository = createMockRepository();
    allergyRepository = createMockRepository();
    prescriptionRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DrugInteractionService,
        {
          provide: getRepositoryToken(DrugInteractionAlert),
          useValue: alertRepository,
        },
        {
          provide: getRepositoryToken(PatientMedicationAllergy),
          useValue: allergyRepository,
        },
        {
          provide: getRepositoryToken(Prescription),
          useValue: prescriptionRepository,
        },
      ],
    }).compile();

    service = module.get<DrugInteractionService>(DrugInteractionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkInteractions', () => {
    it('should detect allergies and create alerts', async () => {
      // Arrange
      const patientId = '123';
      const medicationName = 'Penicillin';
      
      const allergies = [
        {
          id: 'allergy-1',
          patientId,
          substance: 'penicillin',
          status: AllergyStatus.ACTIVE,
          reaction: 'Rash',
        },
      ];
      
      const createdAlert = {
        id: 'alert-1',
        patientId,
        interactionType: InteractionType.DRUG_ALLERGY,
        severity: InteractionSeverity.CONTRAINDICATION,
        description: 'Patient is allergic to penicillin',
        status: AlertStatus.ACTIVE,
      };
      
      allergyRepository.find.mockResolvedValue(allergies);
      alertRepository.create.mockReturnValue(createdAlert);
      alertRepository.save.mockResolvedValue(createdAlert);
      prescriptionRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.checkInteractions(patientId, medicationName);

      // Assert
      expect(allergyRepository.find).toHaveBeenCalledWith({
        where: { patientId, status: 'ACTIVE' },
      });
      expect(alertRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        patientId,
        interactionType: InteractionType.DRUG_ALLERGY,
        severity: InteractionSeverity.CONTRAINDICATION,
      }));
      expect(result.hasSevereInteractions).toBe(true);
      expect(result.alerts).toContainEqual(createdAlert);
    });

    it('should detect drug-drug interactions with active medications', async () => {
      // Arrange
      const patientId = '123';
      const medicationName = 'Warfarin';
      
      const activePatientMedications = [
        { 
          id: '456', 
          patientId, 
          medicationId: '789', 
          medicationName: 'Aspirin', 
          status: PrescriptionStatus.ACTIVE 
        },
      ];

      const createdAlert = {
        id: '789',
        patientId,
        interactionType: InteractionType.DRUG_DRUG,
        severity: InteractionSeverity.MODERATE,
        description: 'Potential interaction between Warfarin and Aspirin',
        status: AlertStatus.ACTIVE,
      };
      
      allergyRepository.find.mockResolvedValue([]);
      prescriptionRepository.find.mockResolvedValue(activePatientMedications);
      alertRepository.create.mockReturnValue(createdAlert);
      alertRepository.save.mockResolvedValue(createdAlert);
      
      // Since we can't easily mock private methods, we'll modify our test approach
      // Set up the mock to save the alert when alertRepository.save is called
      alertRepository.save.mockImplementation((alert) => {
        return Promise.resolve({...alert, id: '789'});
      });

      // Act
      const result = await service.checkInteractions(patientId, medicationName);

      // Assert
      expect(prescriptionRepository.find).toHaveBeenCalledWith({
        where: { 
          patientId,
          status: PrescriptionStatus.ACTIVE,
        },
      });
      expect(alertRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        patientId,
        interactionType: InteractionType.DRUG_DRUG,
      }));
      expect(result.alerts).toContainEqual(createdAlert);
    });

    it('should detect duplicate therapy', async () => {
      // Arrange
      const patientId = '123';
      const medicationName = 'Lisinopril';
      const medicationId = 'med-new';
      
      const activePatientMedications = [
        {
          id: 'med-1',
          patientId,
          medicationName: 'Lisinopril',
          medicationId: 'med-1',
          status: PrescriptionStatus.ACTIVE,
        },
      ];
      
      const createdAlert = {
        id: 'alert-1',
        patientId,
        interactionType: InteractionType.DUPLICATE_THERAPY,
        severity: InteractionSeverity.MODERATE,
        description: 'Duplicate therapy detected: Lisinopril is already prescribed',
        status: AlertStatus.ACTIVE,
      };
      
      allergyRepository.find.mockResolvedValue([]);
      prescriptionRepository.find.mockResolvedValue(activePatientMedications);
      alertRepository.create.mockReturnValue(createdAlert);
      alertRepository.save.mockResolvedValue(createdAlert);

      // Act
      const result = await service.checkInteractions(patientId, medicationName, medicationId);

      // Assert
      expect(alertRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        patientId,
        interactionType: InteractionType.DUPLICATE_THERAPY,
        severity: InteractionSeverity.MODERATE,
      }));
      expect(result.alerts).toContainEqual(createdAlert);
    });

    it('should return no interactions when none are found', async () => {
      // Arrange
      const patientId = '123';
      const medicationName = 'Safe Medication';
      
      allergyRepository.find.mockResolvedValue([]);
      prescriptionRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.checkInteractions(patientId, medicationName);

      // Assert
      expect(result.hasSevereInteractions).toBe(false);
      expect(result.alerts).toEqual([]);
    });
  });

  describe('overrideAlert', () => {
    it('should override an alert', async () => {
      // Arrange
      const alertId = 'alert-1';
      const overriddenBy = 'user-1';
      const overrideReason = 'Clinical necessity';
      
      const alert = {
        id: alertId,
        status: AlertStatus.ACTIVE,
      };
      
      const updatedAlert = {
        ...alert,
        status: AlertStatus.OVERRIDDEN,
        overriddenBy,
        overrideReason,
        overriddenAt: expect.any(Date),
      };
      
      alertRepository.findOne.mockResolvedValue(alert);
      alertRepository.save.mockResolvedValue(updatedAlert);

      // Act
      const result = await service.overrideAlert(alertId, overriddenBy, overrideReason);

      // Assert
      expect(alertRepository.findOne).toHaveBeenCalledWith({ where: { id: alertId } });
      expect(alertRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        id: alertId,
        status: AlertStatus.OVERRIDDEN,
        overriddenBy,
        overrideReason,
        overriddenAt: expect.any(Date),
      }));
      expect(result).toEqual(updatedAlert);
    });

    it('should throw an error when alert is not found', async () => {
      // Arrange
      alertRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.overrideAlert('non-existent', 'user-1', 'reason')
      ).rejects.toThrow('Alert with ID non-existent not found');
    });
  });

  describe('acknowledgeAlert', () => {
    it('should acknowledge an alert', async () => {
      // Arrange
      const alertId = 'alert-1';
      const acknowledgedBy = 'user-1';
      
      const alert = {
        id: alertId,
        status: AlertStatus.ACTIVE,
      };
      
      const updatedAlert = {
        ...alert,
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgedBy,
        acknowledgedAt: expect.any(Date),
      };
      
      alertRepository.findOne.mockResolvedValue(alert);
      alertRepository.save.mockResolvedValue(updatedAlert);

      // Act
      const result = await service.acknowledgeAlert(alertId, acknowledgedBy);

      // Assert
      expect(alertRepository.findOne).toHaveBeenCalledWith({ where: { id: alertId } });
      expect(alertRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        id: alertId,
        status: AlertStatus.ACKNOWLEDGED,
        acknowledgedBy,
        acknowledgedAt: expect.any(Date),
      }));
      expect(result).toEqual(updatedAlert);
    });

    it('should throw an error when alert is not found', async () => {
      // Arrange
      alertRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.acknowledgeAlert('non-existent', 'user-1')
      ).rejects.toThrow('Alert with ID non-existent not found');
    });
  });
});
