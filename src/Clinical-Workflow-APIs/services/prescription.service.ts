import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Prescription, Medication } from '../entities';
import { CreatePrescriptionDto } from '../dto/prescription.dto';

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
    @InjectRepository(Medication)
    private medicationRepository: Repository<Medication>
  ) {}

  async create(createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
    // Validate medication exists
    const medication = await this.medicationRepository.findOne({
      where: { id: createPrescriptionDto.medicationId }
    });
    if (!medication) {
      throw new NotFoundException('Medication not found');
    }

    const prescription = this.prescriptionRepository.create({
      ...createPrescriptionDto,
      medication,
      status: 'active'
    });
    return this.prescriptionRepository.save(prescription);
  }

  async findByPatient(patientId: string): Promise<Prescription[]> {
    return this.prescriptionRepository.find({
      where: { patientId },
      relations: ['medication'],
      order: { createdAt: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: ['medication']
    });
    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }
    return prescription;
  }

  async updateStatus(id: string, status: string): Promise<Prescription> {
    const validStatuses = ['active', 'filled', 'expired', 'cancelled'];
    if (!validStatuses.includes(status)) {
      throw new BadRequestException('Invalid prescription status');
    }
    
    await this.prescriptionRepository.update(id, { status });
    return this.findOne(id);
  }

  async processRefill(id: string): Promise<Prescription> {
    const prescription = await this.findOne(id);
    
    if (prescription.refills <= 0) {
      throw new BadRequestException('No refills remaining');
    }
    
    if (prescription.status !== 'active') {
      throw new BadRequestException('Prescription is not active');
    }

    await this.prescriptionRepository.update(id, {
      refills: prescription.refills - 1,
      status: prescription.refills === 1 ? 'filled' : 'active'
    });
    
    return this.findOne(id);
  }

  async searchMedications(query: string): Promise<Medication[]> {
    return this.medicationRepository.find({
      where: [
        { name: Like(`%${query}%`) },
        { genericName: Like(`%${query}%`) },
        { brandName: Like(`%${query}%`) }
      ],
      take: 20
    });
  }
}