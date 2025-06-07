export class UpdateSurgicalCaseDto {
  procedureType?: string;
  urgency?: 'low' | 'medium' | 'high';
  scheduledAt?: Date;
  status?: 'pending' | 'completed' | 'cancelled';
}