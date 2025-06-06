import { Injectable } from '@nestjs/common';

@Injectable()
export class DecisionSupportService {
  private readonly recommendationsMap: Record<string, string[]> = {
    'E11.9': [
      'Schedule HbA1c test',
      'Start Metformin 500mg once daily',
      'Refer to endocrinologist',
      'Initiate lifestyle counseling',
    ],
    'I10': [
      'Start antihypertensive therapy',
      'Recommend daily BP monitoring',
      'Schedule follow-up in 4 weeks',
    ],
    'J45.909': [
      'Prescribe salbutamol inhaler',
      'Assess asthma triggers',
      'Create asthma action plan',
    ],
  };

  getRecommendations(icd10Code: string): string[] {
    return this.recommendationsMap[icd10Code] || ['No specific recommendations found.'];
  }
}
