import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DrugService } from './drug.service';
import { InventoryService } from './inventory.service';
import { Patient } from '../entities/patient.entity';
import { PrescriptionItem } from '../entities/prescription-item.entity';
import {
  Prescription,
  PrescriptionStatus,
} from '../entities/prescription.entity';
import { SafetyAlertService } from './safety-alert.service';
import { ControlledSubstanceService } from './controlled-substance.service';

export interface CreatePrescriptionDto {
  patientId: string;
  prescriberName: string;
  prescriberLicense: string;
  prescribedDate: Date;
  items: CreatePrescriptionItemDto[];
  notes?: string;
}

export interface CreatePrescriptionItemDto {
  drugId: string;
  quantity: number;
  daysSupply?: number;
  refillsRemaining?: number;
  instructions: string;
}

@Injectable()
export class PrescriptionService {
  constructor(
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
    @InjectRepository(PrescriptionItem)
    private prescriptionItemRepository: Repository<PrescriptionItem>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private safetyAlertService: SafetyAlertService,
    private inventoryService: InventoryService,
    private drugService: DrugService,
    private controlledSubstanceService: ControlledSubstanceService,
  ) {}

  async createPrescription(
    createDto: CreatePrescriptionDto,
  ): Promise<Prescription> {
    const patient = await this.patientRepository.findOne({
      where: { id: createDto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Generate prescription number
    const prescriptionNumber = await this.generatePrescriptionNumber();

    const prescription = this.prescriptionRepository.create({
      ...createDto,
      prescriptionNumber,
      patient,
    });

    const savedPrescription =
      await this.prescriptionRepository.save(prescription);

    // Create prescription items
    for (const itemDto of createDto.items) {
      const drug = await this.drugService.findById(itemDto.drugId);

      const prescriptionItem = this.prescriptionItemRepository.create({
        ...itemDto,
        prescriptionId: savedPrescription.id,
        unitPrice: drug.unitPrice,
        totalPrice: drug.unitPrice * itemDto.quantity,
      });

      await this.prescriptionItemRepository.save(prescriptionItem);

      // Check if it's a controlled substance
      if (drug.schedule !== 'NON_CONTROLLED') {
        savedPrescription.isControlledSubstance = true;
      }
    }

    await this.prescriptionRepository.save(savedPrescription);

    return await this.findById(savedPrescription.id);
  }

  async verifyPrescription(
    id: string,
    pharmacistId: string,
  ): Promise<Prescription> {
    const prescription = await this.findById(id);

    if (prescription.status !== PrescriptionStatus.PENDING) {
      throw new BadRequestException('Prescription is not in pending status');
    }

    // Perform safety checks
    await this.performSafetyChecks(prescription);

    prescription.status = PrescriptionStatus.VERIFIED;
    prescription.verifiedBy = pharmacistId;
    prescription.verifiedAt = new Date();

    return await this.prescriptionRepository.save(prescription);
  }

  async fillPrescription(
    id: string,
    pharmacistId: string,
  ): Promise<Prescription> {
    const prescription = await this.findById(id);

    if (prescription.status !== PrescriptionStatus.VERIFIED) {
      throw new BadRequestException(
        'Prescription must be verified before filling',
      );
    }

    // Check inventory availability
    for (const item of prescription.items) {
      const isAvailable = await this.inventoryService.checkAvailability(
        item.drugId,
        item.quantity,
      );

      if (!isAvailable) {
        throw new BadRequestException(
          `Insufficient inventory for ${item.drug.brandName}`,
        );
      }
    }

    // Reserve inventory
    for (const item of prescription.items) {
      await this.inventoryService.reserveStock(item.drugId, item.quantity);

      // Log controlled substances
      if (item.drug.schedule !== 'NON_CONTROLLED') {
        await this.controlledSubstanceService.logDispensing(
          item.drugId,
          item.quantity,
          prescription.id,
          prescription.patientId,
          pharmacistId,
        );
      }
    }

    prescription.status = PrescriptionStatus.FILLED;
    return await this.prescriptionRepository.save(prescription);
  }

  async dispensePrescription(
    id: string,
    pharmacistId: string,
  ): Promise<Prescription> {
    const prescription = await this.findById(id);

    if (prescription.status !== PrescriptionStatus.FILLED) {
      throw new BadRequestException(
        'Prescription must be filled before dispensing',
      );
    }

    prescription.status = PrescriptionStatus.DISPENSED;
    prescription.dispensedBy = pharmacistId;
    prescription.dispensedAt = new Date();

    return await this.prescriptionRepository.save(prescription);
  }

  private async performSafetyChecks(prescription: Prescription): Promise<void> {
    const patient = prescription.patient;
    const drugIds = prescription.items.map((item) => item.drugId);

    // Check drug interactions
    const interactions = await this.drugService.checkDrugInteractions(drugIds);
    for (const interaction of interactions) {
      await this.safetyAlertService.createDrugInteractionAlert(
        prescription.id,
        patient.id,
        interaction,
      );
    }

    // Check allergies
    for (const item of prescription.items) {
      const hasAllergy = patient.allergies.some((allergy) =>
        item.drug.allergyTriggers.some((trigger) =>
          trigger.toLowerCase().includes(allergy.toLowerCase()),
        ),
      );

      if (hasAllergy) {
        await this.safetyAlertService.createAllergyAlert(
          prescription.id,
          patient.id,
          item.drugId,
          `Patient allergic to components in ${item.drug.brandName}`,
        );
      }
    }
  }

  async findById(id: string): Promise<Prescription> {
    const prescription = await this.prescriptionRepository.findOne({
      where: { id },
      relations: ['patient', 'items', 'items.drug'],
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    return prescription;
  }

  private async generatePrescriptionNumber(): Promise<string> {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0');
    return `RX${timestamp}${random}`;
  }
}
