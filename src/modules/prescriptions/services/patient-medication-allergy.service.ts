import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientMedicationAllergy, AllergyStatus } from '../entities/patient-medication-allergy.entity';
import { CreatePatientMedicationAllergyDto } from '../dto/create-patient-medication-allergy.dto';
import { UpdatePatientMedicationAllergyDto } from '../dto/update-patient-medication-allergy.dto';

@Injectable()
export class PatientMedicationAllergyService {
  constructor(
    @InjectRepository(PatientMedicationAllergy)
    private allergyRepository: Repository<PatientMedicationAllergy>,
  ) {}

  async create(createDto: CreatePatientMedicationAllergyDto): Promise<PatientMedicationAllergy> {
    const allergy = this.allergyRepository.create({
      ...createDto,
      status: createDto.status || AllergyStatus.ACTIVE,
      onsetDate: createDto.onsetDate ? new Date(createDto.onsetDate) : undefined,
    });
    
    return this.allergyRepository.save(allergy);
  }

  async findAll(filters: Partial<PatientMedicationAllergy> = {}): Promise<PatientMedicationAllergy[]> {
    return this.allergyRepository.find({
      where: filters,
      relations: ['recorder', 'updater'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<PatientMedicationAllergy> {
    const allergy = await this.allergyRepository.findOne({
      where: { id },
      relations: ['recorder', 'updater'],
    });
    
    if (!allergy) {
      throw new NotFoundException(`Patient medication allergy with ID ${id} not found`);
    }
    
    return allergy;
  }

  async findByPatient(patientId: string): Promise<PatientMedicationAllergy[]> {
    return this.allergyRepository.find({
      where: { patientId },
      relations: ['recorder', 'updater'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByPatient(patientId: string): Promise<PatientMedicationAllergy[]> {
    return this.allergyRepository.find({
      where: { 
        patientId,
        status: AllergyStatus.ACTIVE,
      },
      relations: ['recorder', 'updater'],
      order: { substance: 'ASC' },
    });
  }

  async update(id: string, updateDto: UpdatePatientMedicationAllergyDto): Promise<PatientMedicationAllergy> {
    const allergy = await this.findOne(id);
    
    Object.assign(allergy, updateDto);
    
    if (updateDto.onsetDate) {
      allergy.onsetDate = new Date(updateDto.onsetDate);
    }
    
    return this.allergyRepository.save(allergy);
  }

  async remove(id: string): Promise<void> {
    const allergy = await this.findOne(id);
    await this.allergyRepository.remove(allergy);
  }

  async inactivate(id: string, updatedBy: string): Promise<PatientMedicationAllergy> {
    const allergy = await this.findOne(id);
    
    allergy.status = AllergyStatus.INACTIVE;
    allergy.updatedBy = updatedBy;
    
    return this.allergyRepository.save(allergy);
  }

  async checkMedicationAllergy(patientId: string, medicationName: string): Promise<boolean> {
    // Get all active allergies for the patient
    const allergies = await this.findActiveByPatient(patientId);
    
    // Check if any allergies match the medication name
    // In a real implementation, this would use a more sophisticated matching algorithm
    // or a medication knowledge base to check for ingredients and classes
    return allergies.some(allergy => {
      const medicationLower = medicationName.toLowerCase();
      const substanceLower = allergy.substance.toLowerCase();
      const substanceClassLower = allergy.substanceClass?.toLowerCase() || '';
      
      return medicationLower.includes(substanceLower) || 
             (substanceClassLower && medicationLower.includes(substanceClassLower));
    });
  }
}
