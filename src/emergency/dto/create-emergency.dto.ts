export class CreateEmergencyDto {
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  chiefComplaint: string;
  symptoms: string;
  triageNotes?: string;
  vitalSigns?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    respiratoryRate?: number;
  };
  allergies?: string[];
  medications?: Array<{
    name: string;
    dosage: string;
    frequency: string;
  }>;
}
