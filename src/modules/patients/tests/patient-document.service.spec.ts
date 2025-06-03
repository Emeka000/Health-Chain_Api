import { Test, TestingModule } from '@nestjs/testing';
import { PatientDocumentService } from '../services/patient-document.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Patient } from '../entities/patient.entity';
import { NotFoundException } from '@nestjs/common';
import { VerifyPatientIdentityDto } from '../dto/patient-document.dto';

// Mock modules
jest.mock('fs', () => ({
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

jest.mock('path', () => ({
  join: jest.fn().mockImplementation((...args) => args.join('/')),
}));

// Mock app-root-path
jest.mock('app-root-path', () => ({
  path: '/mock/root/path',
}));

// Get the mocked modules
const mockFs = jest.requireMock('fs');
const mockPath = jest.requireMock('path');

describe('PatientDocumentService', () => {
  let service: PatientDocumentService;
  let mockPatientRepository;

  const mockPatient = {
    id: '123',
    firstName: 'John',
    lastName: 'Doe',
    photoUrl: null,
    identificationDocumentUrl: null,
    identityVerified: false,
    save: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    mockPatientRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientDocumentService,
        {
          provide: getRepositoryToken(Patient),
          useValue: mockPatientRepository,
        },
      ],
    }).compile();

    service = module.get<PatientDocumentService>(PatientDocumentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadDocument', () => {
    it('should upload a photo document', async () => {
      // Arrange
      const documentDto = {
        patientId: '123',
        documentType: 'photo',
        description: 'Profile photo',
      };
      
      const file = {
        originalname: 'photo.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
      };
      
      mockPatientRepository.findOne.mockResolvedValue(mockPatient);
      mockPatientRepository.save.mockResolvedValue({
        ...mockPatient,
        photoUrl: '/uploads/patients/123-photo.jpg',
      });
      
      mockFs.existsSync.mockReturnValue(true);
      
      // Act
      const result = await service.uploadDocument(documentDto, file);
      
      // Assert
      expect(mockFs.writeFileSync).toHaveBeenCalled();
      expect(result.photoUrl).toBeDefined();
      expect(mockPatientRepository.save).toHaveBeenCalled();
    });
    
    it('should throw NotFoundException if patient not found', async () => {
      // Arrange
      const documentDto = {
        patientId: '999',
        documentType: 'photo',
      };
      
      const file = {
        originalname: 'photo.jpg',
        buffer: Buffer.from('test'),
        mimetype: 'image/jpeg',
      };
      
      mockPatientRepository.findOne.mockResolvedValue(null);
      
      // Act & Assert
      await expect(service.uploadDocument(documentDto, file)).rejects.toThrow(NotFoundException);
    });
  });

  describe('verifyPatientIdentity', () => {
    it('should verify patient identity', async () => {
      // Arrange
      const patientId = '123';
      const verifyDto: VerifyPatientIdentityDto = {
        verified: true,
        notes: 'Verified by Dr. Smith',
      };
      
      mockPatientRepository.findOne.mockResolvedValue(mockPatient);
      mockPatientRepository.save.mockResolvedValue({
        ...mockPatient,
        identityVerified: true,
        identificationVerifiedBy: 'Verified by Dr. Smith',
        identificationVerifiedDate: expect.any(Date),
      });
      
      // Act
      const result = await service.verifyPatientIdentity(patientId, verifyDto);
      
      // Assert
      expect(result.identityVerified).toBe(true);
      expect(mockPatientRepository.save).toHaveBeenCalled();
    });
    
    it('should throw NotFoundException if patient not found', async () => {
      // Arrange
      const patientId = '999';
      const verifyDto: VerifyPatientIdentityDto = {
        verified: true,
        notes: 'Verified by Dr. Smith',
      };
      
      mockPatientRepository.findOne.mockResolvedValue(null);
      
      // Act & Assert
      await expect(service.verifyPatientIdentity(patientId, verifyDto)).rejects.toThrow(NotFoundException);
    });
  });
});
