import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MedicationReconciliation,
  ReconciliationType,
  ReconciliationStatus,
} from '../entities/medication-reconciliation.entity';
import { Patient } from '../entities/patient.entity';

@Injectable()
export class MedicationReconciliationService {
  constructor(
    @InjectRepository(MedicationReconciliation)
    private reconciliationRepository: Repository<MedicationReconciliation>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async initiateReconciliation(
    patientId: string,
    type: ReconciliationType,
    homeMedications: any[],
  ) {
    const patient = await this.patientRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const reconciliation = this.reconciliationRepository.create({
      patient,
      type,
      homeMedications,
      currentMedications: [], // Will be populated with current orders
      status: ReconciliationStatus.PENDING,
    });

    return await this.reconciliationRepository.save(reconciliation);
  }

  async identifyDiscrepancies(reconciliationId: string) {
    const reconciliation = await this.reconciliationRepository.findOne({
      where: { id: reconciliationId },
    });

    if (!reconciliation) {
      throw new NotFoundException('Reconciliation record not found');
    }

    const discrepancies = [];
    const { homeMedications, currentMedications } = reconciliation;

    // Compare medications and identify discrepancies
    for (const homeMed of homeMedications) {
      const matchingCurrent = currentMedications.find(
        (current) => current.name.toLowerCase() === homeMed.name.toLowerCase(),
      );

      if (!matchingCurrent) {
        discrepancies.push({
          type: 'missing_in_current',
          medication: homeMed,
          description: `Home medication ${homeMed.name} not found in current orders`,
        });
      } else if (matchingCurrent.dose !== homeMed.dose) {
        discrepancies.push({
          type: 'dose_discrepancy',
          homeMedication: homeMed,
          currentMedication: matchingCurrent,
          description: `Dose difference: Home ${homeMed.dose} vs Current ${matchingCurrent.dose}`,
        });
      }
    }

    reconciliation.discrepancies = discrepancies;
    reconciliation.status = ReconciliationStatus.IN_PROGRESS;

    return await this.reconciliationRepository.save(reconciliation);
  }
}
