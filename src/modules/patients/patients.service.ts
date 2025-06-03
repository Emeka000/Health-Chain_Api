import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere, DeepPartial } from 'typeorm';
import { Patient } from './entities/patient.entity';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientIdentityService } from './services/patient-identity.service';
import { PatientDocumentService } from './services/patient-document.service';
import { PatientSearchDto } from './dto/patient-search.dto';
import { AdmitPatientDto } from './dto/admit-patient.dto';
import { DischargePatientDto } from './dto/discharge-patient.dto';
import { TransferPatientDto } from './dto/transfer-patient.dto';
import { MergePatientDto } from './dto/merge-patient.dto';
import { PatientStatus } from '../../common/enums';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientsRepository: Repository<Patient>,
    private readonly patientIdentityService: PatientIdentityService,
    private readonly patientDocumentService: PatientDocumentService,
  ) {}

  /**
   * Creates a new patient with automatic MRN generation and duplicate detection
   */
  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    // Generate a unique MRN if not provided
    if (!createPatientDto.medicalRecordNumber) {
      createPatientDto.medicalRecordNumber = await this.patientIdentityService.generateMRN();
    }

    // Convert string dates to Date objects
    const dateOfBirth = new Date(createPatientDto.dateOfBirth);
    const admissionDate = createPatientDto.admissionDate ? new Date(createPatientDto.admissionDate) : undefined;
    const dischargeDate = createPatientDto.dischargeDate ? new Date(createPatientDto.dischargeDate) : undefined;

    // Check for potential duplicates before creating
    const potentialDuplicates = await this.patientIdentityService.findPotentialDuplicates(
      createPatientDto.firstName,
      createPatientDto.lastName,
      dateOfBirth,
      createPatientDto.phoneNumber,
    );

    // Create the patient entity with properly typed data
    const patientData: DeepPartial<Patient> = {
      ...createPatientDto,
      dateOfBirth,
      admissionDate,
      dischargeDate,
    };

    const patient = this.patientsRepository.create(patientData);

    // If SSN is provided, encrypt it
    if (patient.ssn) {
      patient.ssn = this.patientIdentityService.encryptSensitiveData(patient.ssn);
    }

    // Generate identifier hash for duplicate detection
    patient.identifierHash = this.patientIdentityService.generateIdentifierHash(
      patient.firstName,
      patient.lastName,
      dateOfBirth,
      createPatientDto.ssn,
    );

    // Save the patient
    const savedPatient = await this.patientsRepository.save(patient);

    // Create a new object with the patient data and duplicate flags
    const result = {
      ...savedPatient,
      potentialDuplicates: potentialDuplicates.length > 0,
      duplicateCount: potentialDuplicates.length,
    };

    // Return the result with proper type casting
    return result as unknown as Patient;
  }

  /**
   * Finds all patients with optional filtering and privacy controls
   */
  async findAll(searchParams?: PatientSearchDto, userRole?: string): Promise<Patient[]> {
    // Apply privacy controls based on user role
    if (!userRole) {
      throw new ForbiddenException('User role is required to access patient data');
    }

    // Build query with search parameters if provided
    const query: FindOptionsWhere<Patient> = {};
    
    // Only include non-deleted patients by default
    query.isDeleted = false;
    
    if (searchParams) {
      // Apply search filters if provided
      if (searchParams.medicalRecordNumber) {
        query.medicalRecordNumber = searchParams.medicalRecordNumber;
      }
      
      if (searchParams.firstName) {
        query.firstName = ILike(`%${searchParams.firstName}%`);
      }
      
      if (searchParams.lastName) {
        query.lastName = ILike(`%${searchParams.lastName}%`);
      }
      
      if (searchParams.dateOfBirth) {
        query.dateOfBirth = new Date(searchParams.dateOfBirth);
      }
      
      if (searchParams.status) {
        query.status = searchParams.status;
      }
      
      if (searchParams.roomNumber) {
        query.roomNumber = searchParams.roomNumber;
      }
    }
    
    // Execute query with relations
    return this.patientsRepository.find({
      where: query as any,
      relations: ['assignments', 'documentation'],
      order: {
        lastName: 'ASC',
        firstName: 'ASC',
      },
    });
  }

  /**
   * Finds a patient by ID with privacy controls
   */
  async findOne(id: string, userRole?: string): Promise<Patient> {
    // Apply privacy controls based on user role
    if (!userRole) {
      throw new ForbiddenException('User role is required to access patient data');
    }
    
    const patient = await this.patientsRepository.findOne({
      where: { id, isDeleted: false },
      relations: ['assignments', 'documentation'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }

    return patient;
  }
  
  /**
   * Finds a patient by Medical Record Number (MRN)
   */
  async findByMRN(mrn: string, userRole?: string): Promise<Patient> {
    // Apply privacy controls based on user role
    if (!userRole) {
      throw new ForbiddenException('User role is required to access patient data');
    }
    
    const patient = await this.patientsRepository.findOne({
      where: { medicalRecordNumber: mrn, isDeleted: false },
      relations: ['assignments', 'documentation'],
    });

    if (!patient) {
      throw new NotFoundException(`Patient with MRN ${mrn} not found`);
    }

    return patient;
  }

  /**
   * Updates a patient's information
   */
  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
    userRole?: string,
  ): Promise<Patient> {
    const patient = await this.findOne(id, userRole);

    // Create a copy of the DTO to modify
    const updatedData = { ...updatePatientDto };

    // Convert string dates to Date objects if provided
    if (updatedData.dateOfBirth) {
      updatedData.dateOfBirth = new Date(updatedData.dateOfBirth) as unknown as string;
    }

    if (updatedData.admissionDate) {
      updatedData.admissionDate = new Date(updatedData.admissionDate) as unknown as string;
    }

    if (updatedData.dischargeDate) {
      updatedData.dischargeDate = new Date(updatedData.dischargeDate) as unknown as string;
    }
    
    // If SSN is being updated, encrypt it
    if (updatedData.ssn) {
      updatedData.ssn = this.patientIdentityService.encryptSensitiveData(
        updatedData.ssn,
      );
    }

    // Apply updates
    Object.assign(patient, updatedData);
    
    // If name or DOB changed, update identifier hash for duplicate detection
    if (updatedData.firstName || updatedData.lastName || updatedData.dateOfBirth) {
      patient.identifierHash = this.patientIdentityService.generateIdentifierHash(
        patient.firstName,
        patient.lastName,
        patient.dateOfBirth,
        patient.ssn,
      );
    }
    
    return this.patientsRepository.save(patient);
  }
  
  /**
   * Admits a patient (sets status to ADMITTED and records admission date)
   */
  async admitPatient(admitPatientDto: AdmitPatientDto, userRole?: string): Promise<Patient> {
    const patient = await this.findOne(admitPatientDto.patientId, userRole);
    
    patient.status = admitPatientDto.status;
    patient.admissionDate = new Date(admitPatientDto.admissionDate);
    patient.roomNumber = admitPatientDto.roomNumber;
    patient.attendingPhysician = admitPatientDto.attendingPhysician;
    
    if (admitPatientDto.primaryNurse) {
      patient.primaryNurse = admitPatientDto.primaryNurse;
    }
    
    if (admitPatientDto.expectedDischargeDate) {
      patient.expectedDischargeDate = new Date(admitPatientDto.expectedDischargeDate);
    }
    
    // Clear discharge date if readmitting - use type casting to handle null assignment
    patient.dischargeDate = null as unknown as Date;
    
    return this.patientsRepository.save(patient);
  }
  
  /**
   * Discharges a patient (sets status to DISCHARGED and records discharge date)
   */
  async dischargePatient(dischargePatientDto: DischargePatientDto, userRole?: string): Promise<Patient> {
    const patient = await this.findOne(dischargePatientDto.patientId, userRole);
    
    patient.status = dischargePatientDto.status;
    patient.dischargeDate = new Date(dischargePatientDto.dischargeDate);
    
    if (dischargePatientDto.dischargingPhysician) {
      patient.dischargingPhysician = dischargePatientDto.dischargingPhysician;
    }
    
    if (dischargePatientDto.dischargeReason) {
      patient.dischargeReason = dischargePatientDto.dischargeReason;
    }
    
    if (dischargePatientDto.followUpInstructions) {
      patient.followUpInstructions = dischargePatientDto.followUpInstructions;
    }
    
    return this.patientsRepository.save(patient);
  }
  
  /**
   * Transfers a patient to a new room/bed
   */
  async transferPatient(transferPatientDto: TransferPatientDto, userRole?: string): Promise<Patient> {
    const patient = await this.findOne(transferPatientDto.patientId, userRole);
    
    patient.status = transferPatientDto.status;
    patient.roomNumber = transferPatientDto.toRoomNumber;
    patient.attendingPhysician = transferPatientDto.toAttendingPhysician;
    
    if (transferPatientDto.toPrimaryNurse) {
      patient.primaryNurse = transferPatientDto.toPrimaryNurse;
    }
    
    if (transferPatientDto.transferReason) {
      patient.transferReason = transferPatientDto.transferReason;
    }
    
    // Record transfer date
    patient.transferDate = new Date(transferPatientDto.transferDate);
    
    return this.patientsRepository.save(patient);
  }
  
  /**
   * Finds potential duplicate patients
   */
  async findDuplicates(id: string, userRole?: string): Promise<Patient[]> {
    const patient = await this.findOne(id, userRole);
    
    return this.patientIdentityService.findPotentialDuplicates(
      patient.firstName,
      patient.lastName,
      patient.dateOfBirth,
      patient.phoneNumber,
    );
  }
  
  /**
   * Merges two patient records
   */
  async mergePatients(mergePatientDto: MergePatientDto, userRole?: string): Promise<Patient> {
    // Verify user has permission
    if (!userRole || userRole !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can merge patient records');
    }
    
    // Check if the PatientIdentityService supports conflict resolution
    if (typeof this.patientIdentityService.mergePatients === 'function') {
      // Check the number of parameters the function accepts
      if (this.patientIdentityService.mergePatients.length >= 4) {
        // Function supports conflict resolution
        return this.patientIdentityService.mergePatients(
          mergePatientDto.sourcePatientId, 
          mergePatientDto.targetPatientId,
          mergePatientDto.conflictResolutions,
          mergePatientDto.notes
        ) as Promise<Patient>;
      }
    }
    
    // Fallback to basic merge if extended functionality not available
    return this.patientIdentityService.mergePatients(
      mergePatientDto.sourcePatientId, 
      mergePatientDto.targetPatientId
    );
  }
  
  /**
   * Soft deletes a patient record
   */
  async remove(id: string, userRole?: string): Promise<void> {
    // Verify user has permission
    if (!userRole || userRole !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can delete patient records');
    }
    
    const patient = await this.findOne(id, userRole);
    
    // Soft delete by marking as deleted
    patient.isDeleted = true;
    await this.patientsRepository.save(patient);
  }
}
