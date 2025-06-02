import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AdverseDrugReaction,
  SeverityLevel,
} from '../entities/adverse-drug-reaction.entity';
import { Patient } from '../entities/patient.entity';
import { Medication } from '../entities/medication.entity';
import { CreateAdverseDrugReactionDto } from '../dto/adverse-drug-reaction.dto';

@Injectable()
export class AdverseReactionService {
  constructor(
    @InjectRepository(AdverseDrugReaction)
    private adrRepository: Repository<AdverseDrugReaction>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Medication)
    private medicationRepository: Repository<Medication>,
  ) {}

  async reportAdverseReaction(adrDto: CreateAdverseDrugReactionDto) {
    const patient = await this.patientRepository.findOne({
      where: { id: adrDto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const medication = await this.medicationRepository.findOne({
      where: { id: adrDto.medicationId },
    });

    if (!medication) {
      throw new NotFoundException('Medication not found');
    }

    const adr = this.adrRepository.create({
      ...adrDto,
      patient,
      medication,
      onsetDate: new Date(adrDto.onsetDate),
    });

    const savedAdr = await this.adrRepository.save(adr);

    // Auto-notify if severe reaction
    if (
      adr.severity === SeverityLevel.SEVERE ||
      adr.severity === SeverityLevel.LIFE_THREATENING
    ) {
      await this.notifyPhysician(savedAdr.id);
    }

    return savedAdr;
  }

  async notifyPhysician(adrId: string) {
    const adr = await this.adrRepository.findOne({
      where: { id: adrId },
    });

    if (adr) {
      adr.reportedToPhysician = true;
      adr.physicianNotifiedAt = new Date();
      await this.adrRepository.save(adr);

      // Here you would implement actual notification logic (email, SMS, etc.)
      console.log(`Severe ADR reported to physician: ${adr.reaction}`);
    }
  }

  async getPatientAdverseReactions(patientId: string) {
    return await this.adrRepository.find({
      where: { patient: { id: patientId } },
      relations: ['medication'],
      order: { createdAt: 'DESC' },
    });
  }
}
