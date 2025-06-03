import { Test, TestingModule } from '@nestjs/testing';
import { PatientIdentityService } from '../services/patient-identity.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Patient } from '../entities/patient.entity';
import { NotFoundException } from '@nestjs/common';

describe('PatientIdentityService', () => {
  let service: PatientIdentityService;
  let mockPatientRepository;

  const sourcePatient = {
    id: 'source-123',
    firstName: 'John',
    lastName: 'Doe',
    dateOfBirth: new Date('1980-01-01'),
    gender: 'Male',
    phoneNumber: '555-1234',
    email: 'john.doe@example.com',
    address: '123 Main St',
    city: 'Anytown',
    state: 'CA',
    postalCode: '12345',
    allergies: ['Penicillin'],
    detailedAllergies: [{ allergen: 'Penicillin', reaction: 'Rash', severity: 'Moderate' }],
    immunizations: [{ name: 'Flu', date: new Date('2022-10-01') }],
    familyMedicalHistory: [{ condition: 'Diabetes', relation: 'Father' }],
    notes: 'Source patient notes',
    mergedInto: null,
    isMerged: false,
    isDeleted: false,
    medicalRecordNumber: 'MRN-S-123',
  };

  const targetPatient = {
    id: 'target-456',
    firstName: 'Johnny',
    lastName: 'Doe',
    dateOfBirth: new Date('1980-01-01'),
    gender: 'Male',
    phoneNumber: '555-5678',
    email: 'johnny.doe@example.com',
    address: '456 Oak St',
    city: 'Othertown',
    state: 'NY',
    postalCode: '67890',
    allergies: ['Aspirin'],
    detailedAllergies: [{ allergen: 'Aspirin', reaction: 'Hives', severity: 'Severe' }],
    immunizations: [{ name: 'COVID', date: new Date('2021-05-01') }],
    familyMedicalHistory: [{ condition: 'Hypertension', relation: 'Mother' }],
    notes: 'Target patient notes',
    mergedInto: null,
    isMerged: false,
    isDeleted: false,
    medicalRecordNumber: 'MRN-T-456',
  };

  beforeEach(async () => {
    mockPatientRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientIdentityService,
        {
          provide: getRepositoryToken(Patient),
          useValue: mockPatientRepository,
        },
      ],
    }).compile();

    service = module.get<PatientIdentityService>(PatientIdentityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('mergePatients', () => {
    it('should merge patients with default conflict resolution', async () => {
      // Arrange
      mockPatientRepository.findOne
        .mockImplementation((query) => {
          const id = query.where.id;
          if (id === 'source-123') return { ...sourcePatient };
          if (id === 'target-456') return { ...targetPatient };
          return null;
        });

      mockPatientRepository.save.mockImplementation((patient) => Promise.resolve(patient));

      // Act
      const result = await service.mergePatients('source-123', 'target-456');

      // Assert
      expect(result.id).toBe('target-456');
      expect(mockPatientRepository.save).toHaveBeenCalledTimes(2);
      
      // Source patient should be marked as merged and deleted
      const savedSourcePatient = mockPatientRepository.save.mock.calls[0][0];
      expect(savedSourcePatient.isMerged).toBe(true);
      expect(savedSourcePatient.mergedInto).toBe('target-456');
      expect(savedSourcePatient.isDeleted).toBe(true);
      
      // Target patient should have merged data
      const savedTargetPatient = mockPatientRepository.save.mock.calls[1][0];
      expect(savedTargetPatient.allergies).toContain('Penicillin');
      expect(savedTargetPatient.allergies).toContain('Aspirin');
      expect(savedTargetPatient.detailedAllergies).toHaveLength(2);
      expect(savedTargetPatient.immunizations).toHaveLength(2);
      expect(savedTargetPatient.familyMedicalHistory).toHaveLength(2);
      expect(savedTargetPatient.notes).toContain('Source patient notes');
      expect(savedTargetPatient.notes).toContain('Target patient notes');
    });

    it('should merge patients with custom conflict resolutions', async () => {
      // Arrange
      mockPatientRepository.findOne
        .mockImplementation((query) => {
          const id = query.where.id;
          if (id === 'source-123') return { ...sourcePatient };
          if (id === 'target-456') return { ...targetPatient };
          return null;
        });

      mockPatientRepository.save.mockImplementation((patient) => Promise.resolve(patient));

      const conflictResolutions = [
        { field: 'firstName', resolution: 'source' },
        { field: 'phoneNumber', resolution: 'target' },
        { field: 'address', resolution: 'manual', manualValue: '789 New St' }
      ];

      // Act
      const result = await service.mergePatients(
        'source-123', 
        'target-456', 
        conflictResolutions,
        'Merged by Dr. Smith'
      );

      // Assert
      expect(result.firstName).toBe('John'); // From source
      expect(result.phoneNumber).toBe('555-5678'); // From target
      expect(result.address).toBe('789 New St'); // Manual value
      expect(result.notes).toContain('Merged by Dr. Smith');
    });

    it('should throw NotFoundException if source patient not found', async () => {
      // Arrange
      mockPatientRepository.findOne
        .mockImplementation((query) => {
          const id = query.where.id;
          if (id === 'target-456') return { ...targetPatient };
          return null;
        });

      // Act & Assert
      await expect(service.mergePatients('nonexistent', 'target-456')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if target patient not found', async () => {
      // Arrange
      mockPatientRepository.findOne
        .mockImplementation((query) => {
          const id = query.where.id;
          if (id === 'source-123') return { ...sourcePatient };
          return null;
        });

      // Act & Assert
      await expect(service.mergePatients('source-123', 'nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});
