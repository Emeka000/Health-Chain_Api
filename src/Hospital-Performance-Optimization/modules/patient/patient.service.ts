import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cache } from 'cache-manager';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async findById(id: number): Promise<Patient> {
    const cacheKey = `patient:${id}`;
    let patient = await this.cacheManager.get<Patient>(cacheKey);
    
    if (!patient) {
      patient = await this.patientRepository.findOne({
        where: { id },
        relations: ['medicalRecords', 'appointments'],
      });
      
      if (patient) {
        await this.cacheManager.set(cacheKey, patient, 300); // Cache for 5 minutes
      }
    }
    
    return patient;
  }

  async searchPatients(query: string): Promise<Patient[]> {
    const cacheKey = `patient_search:${query}`;
    let patients = await this.cacheManager.get<Patient[]>(cacheKey);
    
    if (!patients) {
      patients = await this.patientRepository
        .createQueryBuilder('patient')
        .where('patient.firstName LIKE :query', { query: `%${query}%` })
        .orWhere('patient.lastName LIKE :query', { query: `%${query}%` })
        .orWhere('patient.medicalRecordNumber LIKE :query', { query: `%${query}%` })
        .limit(50) // Prevent large result sets
        .getMany();
      
      await this.cacheManager.set(cacheKey, patients, 60); // Cache for 1 minute
    }
    
    return patients;
  }

  async create(patientData: Partial<Patient>): Promise<Patient> {
    const patient = this.patientRepository.create(patientData);
    const savedPatient = await this.patientRepository.save(patient);
    
    // Clear related caches
    await this.clearPatientCaches(savedPatient.id);
    
    return savedPatient;
  }

  async update(id: number, updateData: Partial<Patient>): Promise<Patient> {
    await this.patientRepository.update(id, updateData);
    await this.clearPatientCaches(id);
    
    return this.findById(id);
  }

  private async clearPatientCaches(patientId: number): Promise<void> {
    await this.cacheManager.del(`patient:${patientId}`);
    // Clear search caches - in production, use more sophisticated cache invalidation
    const keys = await this.cacheManager.store.keys('patient_search:*');
    await Promise.all(keys.map(key => this.cacheManager.del(key)));
  }
}