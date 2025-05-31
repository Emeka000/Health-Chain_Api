import { Injectable } from '@nestjs/common';

@Injectable()
export class ClinicalDecisionSupportService {
  // Example: Basic alert for drug-allergy interaction
  checkDrugAllergy(patientAllergies: string[], prescribedDrugs: string[]): string[] {
    return prescribedDrugs.filter(drug => patientAllergies.includes(drug));
  }

  // TODO: Add more clinical decision support rules
}
