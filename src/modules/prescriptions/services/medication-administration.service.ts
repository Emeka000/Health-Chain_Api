import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicationAdministration } from '../entities/medication-administration.entity';
import { CreateMedicationAdministrationDto } from '../dto/create-medication-administration.dto';
import { UpdateMedicationAdministrationDto } from '../dto/update-medication-administration.dto';
import { PrescriptionsService } from './prescriptions.service';
import { PrescriptionStatus } from '../enums/prescription-status.enum';

@Injectable()
export class MedicationAdministrationService {
  constructor(
    @InjectRepository(MedicationAdministration)
    private administrationRepository: Repository<MedicationAdministration>,
    private prescriptionsService: PrescriptionsService,
  ) {}

  async create(createDto: CreateMedicationAdministrationDto): Promise<MedicationAdministration> {
    // Verify the prescription exists and is active
    const prescription = await this.prescriptionsService.findOne(createDto.prescriptionId);
    
    if (prescription.status !== PrescriptionStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot administer medication for prescription with status: ${prescription.status}`,
      );
    }
    
    // Verify the patient ID matches the prescription
    if (prescription.patientId !== createDto.patientId) {
      throw new BadRequestException(
        'Patient ID does not match the patient associated with this prescription',
      );
    }
    
    // Create the administration record
    const administration = this.administrationRepository.create({
      ...createDto,
      administeredAt: new Date(createDto.administeredAt),
    });
    
    return this.administrationRepository.save(administration);
  }

  async findAll(filters: Partial<MedicationAdministration> = {}): Promise<MedicationAdministration[]> {
    return this.administrationRepository.find({
      where: filters,
      relations: ['prescription', 'administrator'],
      order: { administeredAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<MedicationAdministration> {
    const administration = await this.administrationRepository.findOne({
      where: { id },
      relations: ['prescription', 'administrator'],
    });
    
    if (!administration) {
      throw new NotFoundException(`Medication administration with ID ${id} not found`);
    }
    
    return administration;
  }

  async findByPrescription(prescriptionId: string): Promise<MedicationAdministration[]> {
    return this.administrationRepository.find({
      where: { prescriptionId },
      relations: ['administrator'],
      order: { administeredAt: 'DESC' },
    });
  }

  async findByPatient(patientId: string): Promise<MedicationAdministration[]> {
    return this.administrationRepository.find({
      where: { patientId },
      relations: ['prescription', 'administrator'],
      order: { administeredAt: 'DESC' },
    });
  }

  async update(id: string, updateDto: UpdateMedicationAdministrationDto): Promise<MedicationAdministration> {
    const administration = await this.findOne(id);
    
    // Check if we're trying to change the prescription or patient
    if (
      (updateDto.prescriptionId && updateDto.prescriptionId !== administration.prescriptionId) ||
      (updateDto.patientId && updateDto.patientId !== administration.patientId)
    ) {
      throw new BadRequestException(
        'Cannot change prescription or patient for an existing administration record',
      );
    }
    
    // Update the administration record
    Object.assign(administration, updateDto);
    
    if (updateDto.administeredAt) {
      administration.administeredAt = new Date(updateDto.administeredAt);
    }
    
    return this.administrationRepository.save(administration);
  }

  async remove(id: string): Promise<void> {
    const administration = await this.findOne(id);
    await this.administrationRepository.remove(administration);
  }

  async getPatientMedicationHistory(patientId: string, days: number = 30): Promise<MedicationAdministration[]> {
    // Calculate the date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.administrationRepository
      .createQueryBuilder('admin')
      .innerJoinAndSelect('admin.prescription', 'prescription')
      .innerJoinAndSelect('admin.administrator', 'administrator')
      .where('admin.patientId = :patientId', { patientId })
      .andWhere('admin.administeredAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .orderBy('admin.administeredAt', 'DESC')
      .getMany();
  }
}
