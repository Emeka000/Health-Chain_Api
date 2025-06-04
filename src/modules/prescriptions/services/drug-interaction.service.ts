import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DrugInteractionAlert, InteractionSeverity, InteractionType, AlertStatus } from '../entities/drug-interaction-alert.entity';
import { PatientMedicationAllergy, AllergyStatus } from '../entities/patient-medication-allergy.entity';
// PatientMedicationAllergy is now imported above with AllergyStatus
import { Prescription } from '../entities/prescription.entity';
import { PrescriptionStatus } from '../enums/prescription-status.enum';

interface InteractionCheckResult {
  hasSevereInteractions: boolean;
  alerts: DrugInteractionAlert[];
}

@Injectable()
export class DrugInteractionService {
  constructor(
    @InjectRepository(DrugInteractionAlert)
    private alertRepository: Repository<DrugInteractionAlert>,
    @InjectRepository(PatientMedicationAllergy)
    private allergyRepository: Repository<PatientMedicationAllergy>,
    @InjectRepository(Prescription)
    private prescriptionRepository: Repository<Prescription>,
  ) {}

  async checkInteractions(
    patientId: string,
    medicationName: string,
    medicationId?: string,
  ): Promise<InteractionCheckResult> {
    const alerts: DrugInteractionAlert[] = [];
    let hasSevereInteractions = false;

    // Step 1: Check for allergies
    const allergies = await this.allergyRepository.find({
      where: { patientId, status: AllergyStatus.ACTIVE } as any,
    });

    // Check if the patient is allergic to this medication
    const matchingAllergies = allergies.filter(allergy => {
      // Simple substring match - in a real system, you'd use a more sophisticated matching system
      // or a medication knowledge base API
      return medicationName.toLowerCase().includes(allergy.substance.toLowerCase()) ||
             (allergy.substanceClass && medicationName.toLowerCase().includes(allergy.substanceClass.toLowerCase()));
    });

    if (matchingAllergies.length > 0) {
      // Create an alert for each matching allergy
      for (const allergy of matchingAllergies) {
        const alert = this.alertRepository.create({
          patientId,
          interactionType: InteractionType.DRUG_ALLERGY,
          severity: InteractionSeverity.CONTRAINDICATION, // Allergies are considered contraindications
          description: `Patient is allergic to ${allergy.substance}`,
          evidenceText: `Allergy recorded: ${allergy.reaction || 'No specific reaction noted'}`,
          recommendedAction: 'Consider alternative medication',
          status: AlertStatus.ACTIVE,
          requiresAcknowledgment: true,
        });
        
        const savedAlert = await this.alertRepository.save(alert);
        alerts.push(savedAlert);
        hasSevereInteractions = true;
      }
    }

    // Step 2: Check for drug-drug interactions with active medications
    const activePatientMedications = await this.prescriptionRepository.find({
      where: { 
        patientId,
        status: PrescriptionStatus.ACTIVE,
      },
    });

    // In a real system, you would call a drug interaction API or database here
    // For this example, we'll simulate some basic interactions
    for (const existingMed of activePatientMedications) {
      // Skip checking against itself if this is an update to an existing prescription
      if (existingMed.medicationId === medicationId) {
        continue;
      }

      // Simulate checking for interactions
      // In reality, you would use a drug interaction API or database
      const hasInteraction = this.simulateDrugInteractionCheck(
        medicationName,
        existingMed.medicationName,
      );

      if (hasInteraction) {
        const severity = this.determineSeverity(medicationName, existingMed.medicationName);
        
        const alert = this.alertRepository.create({
          patientId,
          interactionType: InteractionType.DRUG_DRUG,
          severity,
          description: `Potential interaction between ${medicationName} and ${existingMed.medicationName}`,
          evidenceText: 'Simulated interaction check',
          recommendedAction: severity === InteractionSeverity.CONTRAINDICATION || severity === InteractionSeverity.SEVERE
            ? 'Consider alternative medication or obtain override authorization'
            : 'Monitor patient closely',
          status: AlertStatus.ACTIVE,
          requiresAcknowledgment: severity === InteractionSeverity.CONTRAINDICATION || severity === InteractionSeverity.SEVERE,
        });
        
        const savedAlert = await this.alertRepository.save(alert);
        alerts.push(savedAlert);
        
        if (severity === InteractionSeverity.CONTRAINDICATION || severity === InteractionSeverity.SEVERE) {
          hasSevereInteractions = true;
        }
      }
    }

    // Step 3: Check for duplicate therapy
    const duplicateTherapy = activePatientMedications.find(med => 
      med.medicationName.toLowerCase() === medicationName.toLowerCase() &&
      med.medicationId !== medicationId // Not the same prescription
    );

    if (duplicateTherapy) {
      const alert = this.alertRepository.create({
        patientId,
        interactionType: InteractionType.DUPLICATE_THERAPY,
        severity: InteractionSeverity.MODERATE,
        description: `Duplicate therapy detected: ${medicationName} is already prescribed`,
        evidenceText: `Existing prescription ID: ${duplicateTherapy.id}`,
        recommendedAction: 'Review and confirm if duplicate therapy is intended',
        status: AlertStatus.ACTIVE,
        requiresAcknowledgment: true,
      });
      
      const savedAlert = await this.alertRepository.save(alert);
      alerts.push(savedAlert);
    }

    return {
      hasSevereInteractions,
      alerts,
    };
  }

  async overrideAlert(
    alertId: string,
    overriddenBy: string,
    overrideReason: string,
  ): Promise<DrugInteractionAlert> {
    const alert = await this.alertRepository.findOne({ where: { id: alertId } });
    
    if (!alert) {
      throw new Error(`Alert with ID ${alertId} not found`);
    }
    
    alert.status = AlertStatus.OVERRIDDEN;
    alert.overriddenBy = overriddenBy;
    alert.overrideReason = overrideReason;
    alert.overriddenAt = new Date();
    
    return this.alertRepository.save(alert);
  }

  async acknowledgeAlert(
    alertId: string,
    acknowledgedBy: string,
  ): Promise<DrugInteractionAlert> {
    const alert = await this.alertRepository.findOne({ where: { id: alertId } });
    
    if (!alert) {
      throw new Error(`Alert with ID ${alertId} not found`);
    }
    
    alert.status = AlertStatus.ACKNOWLEDGED;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();
    
    return this.alertRepository.save(alert);
  }

  private simulateDrugInteractionCheck(drug1: string, drug2: string): boolean {
    // This is a simplified simulation
    // In a real system, you would use a drug interaction database or API
    
    // Common drug interactions (simplified for example)
    const knownInteractions: Record<string, string[]> = {
      'warfarin': ['aspirin', 'ibuprofen', 'naproxen', 'fluconazole', 'amiodarone', 'ciprofloxacin'],
      'simvastatin': ['clarithromycin', 'itraconazole', 'ketoconazole', 'erythromycin', 'gemfibrozil'],
      'lisinopril': ['spironolactone', 'potassium supplements', 'lithium'],
      'digoxin': ['amiodarone', 'verapamil', 'clarithromycin'],
      'methotrexate': ['trimethoprim', 'sulfamethoxazole', 'nsaids'],
    };
    
    // Normalize drug names for comparison
    const drug1Lower = drug1.toLowerCase();
    const drug2Lower = drug2.toLowerCase();
    
    // Check if either drug is in our known interactions list and if the other drug is in its interaction list
    for (const [baseDrug, interactingDrugs] of Object.entries(knownInteractions)) {
      if (drug1Lower.includes(baseDrug)) {
        if (interactingDrugs.some(interactingDrug => drug2Lower.includes(interactingDrug))) {
          return true;
        }
      }
      
      if (drug2Lower.includes(baseDrug)) {
        if (interactingDrugs.some(interactingDrug => drug1Lower.includes(interactingDrug))) {
          return true;
        }
      }
    }
    
    return false;
  }

  private determineSeverity(drug1: string, drug2: string): InteractionSeverity {
    // This is a simplified simulation
    // In a real system, you would use a drug interaction database or API to get the severity
    
    // Some known severe interactions
    const severeInteractions = [
      ['warfarin', 'fluconazole'],
      ['simvastatin', 'itraconazole'],
      ['methotrexate', 'trimethoprim'],
    ];
    
    // Normalize drug names for comparison
    const drug1Lower = drug1.toLowerCase();
    const drug2Lower = drug2.toLowerCase();
    
    // Check for severe interactions
    for (const [drug1Severe, drug2Severe] of severeInteractions) {
      if (
        (drug1Lower.includes(drug1Severe) && drug2Lower.includes(drug2Severe)) ||
        (drug1Lower.includes(drug2Severe) && drug2Lower.includes(drug1Severe))
      ) {
        return InteractionSeverity.SEVERE;
      }
    }
    
    // If it's a known interaction but not severe, default to moderate
    if (this.simulateDrugInteractionCheck(drug1, drug2)) {
      return InteractionSeverity.MODERATE;
    }
    
    // Default to mild if no specific severity is determined
    return InteractionSeverity.MILD;
  }
}
