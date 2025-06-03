import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Prescription } from '../entities/prescription.entity';
import { CreatePrescriptionDto } from '../dto/create-prescription.dto';
import { UpdatePrescriptionDto } from '../dto/update-prescription.dto';
import { PrescriptionStatus } from '../enums/prescription-status.enum';
import { DrugInteractionService } from './drug-interaction.service';

@Injectable()
export class PrescriptionsService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
    private drugInteractionService: DrugInteractionService,
  ) {}

  async create(createPrescriptionDto: CreatePrescriptionDto): Promise<Prescription> {
    // Check for drug interactions and allergies before creating prescription
    const interactionAlerts = await this.drugInteractionService.checkInteractions(
      createPrescriptionDto.patientId,
      createPrescriptionDto.medicationName,
      createPrescriptionDto.medicationId,
    );

    // If there are severe interactions, we might want to prevent the prescription
    // or require explicit override
    if (interactionAlerts.hasSevereInteractions) {
      throw new BadRequestException(
        'Severe drug interactions detected. Please review alerts and provide override if appropriate.',
      );
    }

    const prescription = this.prescriptionRepository.create({
      ...createPrescriptionDto,
      status: PrescriptionStatus.PENDING_APPROVAL,
      refillsRemaining: createPrescriptionDto.refillsAllowed || 0,
      contraindicationsChecked: true, // Since we've checked interactions
    });

    return this.prescriptionRepository.save(prescription);
  }

  async findAll(filters: Record<string, any> = {}): Promise<Prescription[]> {
    return this.prescriptionRepository.find({
      where: filters as any,
      relations: ['patient', 'prescribingProvider', 'medication', 'pharmacy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: ['patient', 'prescribingProvider', 'medication', 'pharmacy', 'administrations'],
    });

    if (!prescription) {
      throw new NotFoundException(`Prescription with ID ${id} not found`);
    }

    return prescription;
  }

  async findByPatient(patientId: string): Promise<Prescription[]> {
    return this.prescriptionRepository.find({
      where: { patientId },
      relations: ['prescribingProvider', 'medication', 'pharmacy'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveByPatient(patientId: string): Promise<Prescription[]> {
    return this.prescriptionRepository.find({
      where: { 
        patientId,
        status: PrescriptionStatus.ACTIVE,
      },
      relations: ['prescribingProvider', 'medication', 'pharmacy'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updatePrescriptionDto: UpdatePrescriptionDto): Promise<Prescription> {
    const prescription = await this.findOne(id);
    
    // If status is changing to ACTIVE, check interactions again
    if (
      updatePrescriptionDto.status === PrescriptionStatus.ACTIVE && 
      prescription.status !== PrescriptionStatus.ACTIVE
    ) {
      const interactionAlerts = await this.drugInteractionService.checkInteractions(
        prescription.patientId,
        prescription.medicationName,
        prescription.medicationId,
      );

      if (interactionAlerts.hasSevereInteractions) {
        throw new BadRequestException(
          'Severe drug interactions detected. Cannot activate prescription.',
        );
      }
    }

    // Update the prescription
    Object.assign(prescription, updatePrescriptionDto);
    
    return this.prescriptionRepository.save(prescription);
  }

  async approve(id: string, pharmacistId: string): Promise<Prescription> {
    const prescription = await this.findOne(id);
    
    if (prescription.status !== PrescriptionStatus.PENDING_APPROVAL) {
      throw new BadRequestException('Only pending prescriptions can be approved');
    }
    
    prescription.status = PrescriptionStatus.ACTIVE;
    prescription.authorizingPharmacistId = pharmacistId;
    prescription.verificationTimestamp = new Date();
    
    return this.prescriptionRepository.save(prescription);
  }

  async cancel(id: string, reason: string, updatedBy: string): Promise<Prescription> {
    const prescription = await this.findOne(id);
    
    if (
      prescription.status === PrescriptionStatus.CANCELLED || 
      prescription.status === PrescriptionStatus.EXPIRED
    ) {
      throw new BadRequestException('Prescription is already cancelled or expired');
    }
    
    prescription.status = PrescriptionStatus.CANCELLED;
    prescription.cancellationReason = reason;
    prescription.updatedBy = updatedBy;
    
    return this.prescriptionRepository.save(prescription);
  }

  async refill(id: string, updatedBy: string): Promise<Prescription> {
    const prescription = await this.findOne(id);
    
    if (prescription.status !== PrescriptionStatus.ACTIVE) {
      throw new BadRequestException('Only active prescriptions can be refilled');
    }
    
    if (prescription.refillsRemaining <= 0) {
      throw new BadRequestException('No refills remaining for this prescription');
    }
    
    prescription.refillsRemaining -= 1;
    prescription.updatedBy = updatedBy;
    
    return this.prescriptionRepository.save(prescription);
  }

  async remove(id: string): Promise<void> {
    const prescription = await this.findOne(id);
    await this.prescriptionRepository.remove(prescription);
  }
}
