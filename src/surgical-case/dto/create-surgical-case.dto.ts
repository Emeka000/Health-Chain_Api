export class CreateSurgicalCaseDto {
  patientId: string;
  procedureType: string;
  urgency: 'low' | 'medium' | 'high';
  scheduledAt: Date;
}