import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { PatientDocumentDto, VerifyPatientIdentityDto } from '../dto/patient-document.dto';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class PatientDocumentService {
  private readonly uploadDir: string;

  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {
    // Create uploads directory if it doesn't exist
    this.uploadDir = path.join(process.cwd(), 'uploads', 'patients');
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Uploads and saves a patient photo
   */
  async uploadPatientPhoto(
    documentDto: PatientDocumentDto,
    file: any,
  ): Promise<Patient> {
    const patientId = documentDto.patientId;
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    // Validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, JPG, and PNG are allowed.',
      );
    }

    // Generate a unique filename
    const fileExt = path.extname(file.originalname);
    const fileName = `${patientId}-photo-${Date.now()}${fileExt}`;
    const filePath = path.join(this.uploadDir, fileName);

    // Write file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Update patient record with photo URL
    patient.photoUrl = `/uploads/patients/${fileName}`;
    return this.patientRepository.save(patient);
  }

  /**
   * Uploads and saves a patient identification document
   */
  async uploadDocument(
    documentDto: PatientDocumentDto,
    file: any,
  ): Promise<Patient> {
    const patientId = documentDto.patientId;
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Invalid file type. Only JPEG, JPG, PNG, and PDF are allowed.',
      );
    }

    // Generate a unique filename with a hash for security
    const fileHash = crypto
      .createHash('sha256')
      .update(`${patientId}-${Date.now()}`)
      .digest('hex')
      .substring(0, 16);
    const fileExt = path.extname(file.originalname);
    const fileName = `${fileHash}-id${fileExt}`;
    const filePath = path.join(this.uploadDir, fileName);

    // Write file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Update patient record based on document type
    if (documentDto.documentType === 'identification') {
      patient.identificationDocumentUrl = `/uploads/patients/${fileName}`;
      patient.identityVerified = false; // Reset verification status
      patient.identificationVerifiedBy = null as unknown as string;
      patient.identificationVerifiedDate = null as unknown as Date;

      // Add description if provided
      if (documentDto.description) {
        if (!patient.notes) {
          patient.notes = '';
        }
        patient.notes += `\n[ID DOCUMENT ${new Date().toISOString()}] ${documentDto.description}`;
      }
    } else {
      // For other document types, store in a generic documents array
      if (!patient.documents) {
        patient.documents = [];
      }
      
      patient.documents.push({
        url: `/uploads/patients/${fileName}`,
        type: documentDto.documentType,
        description: documentDto.description || '',
        uploadDate: new Date(),
      });
    }
    return this.patientRepository.save(patient);
  }

  /**
   * Verify a patient's identity
   */
  async verifyPatientIdentity(
    patientId: string,
    verifyDto: VerifyPatientIdentityDto,
  ): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId } as Record<string, any>,
    });

    if (!patient) {
      throw new NotFoundException(`Patient with ID ${patientId} not found`);
    }

    if (!patient.identificationDocumentUrl) {
      throw new BadRequestException(
        'Patient has no identification document uploaded',
      );
    }

    // Update verification status
    patient.identityVerified = verifyDto.verified;
    
    // Add verification metadata
    patient.identificationVerifiedBy = verifyDto.notes || 'System verification';
    patient.identificationVerifiedDate = new Date();

    return this.patientRepository.save(patient);
  }

  /**
   * Retrieves a patient's photo
   */
  async getPatientPhoto(patientId: string): Promise<{ path: string; filename: string }> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient || !patient.photoUrl) {
      throw new NotFoundException('Patient photo not found');
    }

    const filename = path.basename(patient.photoUrl);
    const filePath = path.join(this.uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Patient photo file not found');
    }

    return { path: filePath, filename };
  }

  /**
   * Retrieves a patient's identification document
   */
  async getIdentificationDocument(patientId: string): Promise<{ path: string; filename: string }> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient || !patient.identificationDocumentUrl) {
      throw new NotFoundException('Patient identification document not found');
    }

    const filename = path.basename(patient.identificationDocumentUrl);
    const filePath = path.join(this.uploadDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Patient identification document file not found');
    }

    return { path: filePath, filename };
  }

  /**
   * Deletes a patient's photo
   */
  async deletePatientPhoto(patientId: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient || !patient.photoUrl) {
      throw new NotFoundException('Patient photo not found');
    }

    const filename = path.basename(patient.photoUrl);
    const filePath = path.join(this.uploadDir, filename);

    // Delete file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Update patient record
    patient.photoUrl = '';
    return this.patientRepository.save(patient);
  }

  /**
   * Deletes a patient's identification document
   */
  async deleteIdentificationDocument(patientId: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient || !patient.identificationDocumentUrl) {
      throw new NotFoundException('Patient identification document not found');
    }

    const filename = path.basename(patient.identificationDocumentUrl);
    const filePath = path.join(this.uploadDir, filename);

    // Delete file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Update patient record
    patient.identificationDocumentUrl = '';
    patient.identityVerified = false;
    return this.patientRepository.save(patient);
  }
}
