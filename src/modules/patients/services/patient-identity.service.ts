import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class PatientIdentityService {
  constructor(
    @InjectRepository(Patient)
    private readonly patientRepository: Repository<Patient>,
  ) {}

  /**
   * Generates a unique Medical Record Number (MRN) for a patient
   * Format: HC-YYYY-XXXXXX (where YYYY is the current year and XXXXXX is a random 6-digit number)
   */
  async generateMRN(): Promise<string> {
    const year = new Date().getFullYear();
    let isUnique = false;
    let mrn = '';

    while (!isUnique) {
      // Generate a random 6-digit number
      const randomDigits = Math.floor(100000 + Math.random() * 900000);
      mrn = `HC-${year}-${randomDigits}`;

      // Check if this MRN already exists
      const existingPatient = await this.patientRepository.findOne({
        where: { medicalRecordNumber: mrn },
      });

      if (!existingPatient) {
        isUnique = true;
      }
    }

    return mrn;
  }

  /**
   * Generates a secure identifier hash for a patient based on their demographics
   * Used for duplicate detection
   */
  generateIdentifierHash(
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
    ssn?: string,
  ): string {
    // Create a normalized string with the patient's key identifiers
    const identifierString = `${firstName.toLowerCase()}|${lastName.toLowerCase()}|${dateOfBirth.toISOString()}|${
      ssn || ''
    }`;
    
    // Create a hash of the identifier string
    return bcrypt.hashSync(identifierString, 10);
  }

  /**
   * Encrypts sensitive patient data like SSN
   */
  encryptSensitiveData(data: string): string {
    return bcrypt.hashSync(data, 10);
  }

  /**
   * Verifies if the provided SSN matches the encrypted one
   */
  verifySensitiveData(plainText: string, hash: string): boolean {
    return bcrypt.compareSync(plainText, hash);
  }

  /**
   * Generates a secure token for patient identity verification
   */
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Checks for potential duplicate patients based on demographics
   * Returns an array of potential duplicate patients
   */
  async findPotentialDuplicates(
    firstName: string,
    lastName: string,
    dateOfBirth: Date,
    phoneNumber?: string,
  ): Promise<Patient[]> {
    // First check for exact matches on name and DOB
    const exactMatches = await this.patientRepository
      .createQueryBuilder('patient')
      .where(
        'LOWER(patient.firstName) = LOWER(:firstName) AND LOWER(patient.lastName) = LOWER(:lastName) AND patient.dateOfBirth = :dateOfBirth',
        {
          firstName,
          lastName,
          dateOfBirth,
        },
      )
      .getMany();

    if (exactMatches.length > 0) {
      return exactMatches;
    }

    // Check for fuzzy matches (similar names, same DOB)
    const fuzzyMatches = await this.patientRepository
      .createQueryBuilder('patient')
      .where(
        '(SOUNDEX(patient.firstName) = SOUNDEX(:firstName) OR SOUNDEX(patient.lastName) = SOUNDEX(:lastName)) AND patient.dateOfBirth = :dateOfBirth',
        {
          firstName,
          lastName,
          dateOfBirth,
        },
      )
      .getMany();

    // If phone number is provided, check for matches with the same phone number
    if (phoneNumber) {
      const phoneMatches = await this.patientRepository.find({
        where: { phoneNumber },
      });
      
      // Combine results, removing duplicates
      const allMatches = [...fuzzyMatches];
      for (const match of phoneMatches) {
        if (!allMatches.some(m => m.id === match.id)) {
          allMatches.push(match);
        }
      }
      
      return allMatches;
    }

    return fuzzyMatches;
  }

  /**
   * Merges two patient records with optional conflict resolution
   * @param sourcePatientId ID of the source patient to merge from
   * @param targetPatientId ID of the target patient to merge into
   * @param conflictResolutions Optional array of conflict resolutions
   * @param notes Optional notes about the merge
   */
  async mergePatients(
    sourcePatientId: string, 
    targetPatientId: string,
    conflictResolutions?: Array<{ field: string; resolution: string; manualValue?: string }>,
    notes?: string
  ): Promise<Patient> {
    const sourcePatient = await this.patientRepository.findOne({
      where: { id: sourcePatientId } as Record<string, any>,
      relations: ['assignments', 'documentation'],
    });

    const targetPatient = await this.patientRepository.findOne({
      where: { id: targetPatientId } as Record<string, any>,
      relations: ['assignments', 'documentation'],
    });

    if (!sourcePatient || !targetPatient) {
      throw new Error('One or both patients not found');
    }

    // Handle conflict resolutions if provided
    if (conflictResolutions && conflictResolutions.length > 0) {
      for (const conflict of conflictResolutions) {
        const field = conflict.field;
        
        // Skip if field doesn't exist on either patient
        if (!(field in sourcePatient) && !(field in targetPatient)) {
          continue;
        }
        
        switch (conflict.resolution) {
          case 'sourcePatient':
            // Use source patient's value
            if (field in sourcePatient && sourcePatient[field] !== undefined && sourcePatient[field] !== null) {
              targetPatient[field] = sourcePatient[field];
            }
            break;
            
          case 'targetPatient':
            // Keep target patient's value (do nothing)
            break;
            
          case 'manual':
            // Use manually provided value
            if (conflict.manualValue !== undefined) {
              targetPatient[field] = conflict.manualValue;
            }
            break;
            
          default:
            // Default to target's value
            break;
        }
      }
    } else {
      // Default merge strategy when no conflict resolutions provided
      // Update non-critical fields if they're empty in target but present in source
      const fieldsToMerge = [
        'phoneNumber', 'email', 'alternatePhoneNumber', 'pronouns', 'occupation',
        'employer', 'employerPhone', 'preferredLanguage', 'ethnicity', 'race',
        'bloodType', 'organDonor', 'height', 'weight'
      ];
      
      for (const field of fieldsToMerge) {
        if (!targetPatient[field] && sourcePatient[field]) {
          targetPatient[field] = sourcePatient[field];
        }
      }
    }
    
    // Always merge arrays and complex objects
    
    // Merge allergies
    if (sourcePatient.allergies && sourcePatient.allergies.length > 0) {
      if (!targetPatient.allergies) {
        targetPatient.allergies = [];
      }
      
      // Add unique allergies from source
      sourcePatient.allergies.forEach(allergy => {
        if (!targetPatient.allergies.includes(allergy)) {
          targetPatient.allergies.push(allergy);
        }
      });
    }
    
    // Merge detailed allergies
    if (sourcePatient.detailedAllergies && sourcePatient.detailedAllergies.length > 0) {
      if (!targetPatient.detailedAllergies) {
        targetPatient.detailedAllergies = [];
      }
      
      // Add unique detailed allergies from source
      sourcePatient.detailedAllergies.forEach(allergy => {
        const exists = targetPatient.detailedAllergies.some(
          a => a.substance === allergy.substance && a.reaction === allergy.reaction
        );
        
        if (!exists) {
          targetPatient.detailedAllergies.push(allergy);
        }
      });
    }
    
    // Merge immunizations
    if (sourcePatient.immunizations && sourcePatient.immunizations.length > 0) {
      if (!targetPatient.immunizations) {
        targetPatient.immunizations = [];
      }
      
      // Add unique immunizations from source
      sourcePatient.immunizations.forEach(immunization => {
        const exists = targetPatient.immunizations.some(
          i => i.name === immunization.name && i.date.getTime() === immunization.date.getTime()
        );
        
        if (!exists) {
          targetPatient.immunizations.push(immunization);
        }
      });
    }
    
    // Merge family medical history
    if (sourcePatient.familyMedicalHistory && sourcePatient.familyMedicalHistory.length > 0) {
      if (!targetPatient.familyMedicalHistory) {
        targetPatient.familyMedicalHistory = [];
      }
      
      // Add unique family medical history from source
      sourcePatient.familyMedicalHistory.forEach(history => {
        const exists = targetPatient.familyMedicalHistory.some(
          h => h.condition === history.condition && h.relationship === history.relationship
        );
        
        if (!exists) {
          targetPatient.familyMedicalHistory.push(history);
        }
      });
    }
    
    // Add merge notes if provided
    if (notes) {
      if (!targetPatient.notes) {
        targetPatient.notes = '';
      }
      targetPatient.notes += `\n[MERGE ${new Date().toISOString()}] ${notes}`;
    }

    // Merge medications
    if (sourcePatient.currentMedications && sourcePatient.currentMedications.length > 0) {
      if (!targetPatient.currentMedications) {
        targetPatient.currentMedications = [];
      }
      
      for (const med of sourcePatient.currentMedications) {
        if (!targetPatient.currentMedications.some(m => m.name === med.name && m.dosage === med.dosage)) {
          targetPatient.currentMedications.push(med);
        }
      }
    }

    // Mark the source patient as merged and reference the target patient
    sourcePatient.isDeleted = true;
    sourcePatient.mergedIntoPatientId = targetPatientId;
    
    // Save both patients
    await this.patientRepository.save(sourcePatient);
    return this.patientRepository.save(targetPatient);
  }
}
