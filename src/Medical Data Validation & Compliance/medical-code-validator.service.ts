import { Injectable, Logger } from '@nestjs/common';

interface ICD10Code {
  code: string;
  description: string;
  category: string;
}

interface CPTCode {
  code: string;
  description: string;
  category: string;
}

@Injectable()
export class MedicalCodeValidatorService {
  private readonly logger = new Logger(MedicalCodeValidatorService.name);
  
  // In production, these would be loaded from medical code databases
  private readonly icd10Codes: Map<string, ICD10Code> = new Map([
    ['Z00.00', { code: 'Z00.00', description: 'Encounter for general adult medical examination without abnormal findings', category: 'Factors influencing health status' }],
    ['I10', { code: 'I10', description: 'Essential hypertension', category: 'Circulatory system diseases' }],
    ['E11.9', { code: 'E11.9', description: 'Type 2 diabetes mellitus without complications', category: 'Endocrine diseases' }],
    ['J44.1', { code: 'J44.1', description: 'Chronic obstructive pulmonary disease with acute exacerbation', category: 'Respiratory diseases' }]
  ]);

  private readonly cptCodes: Map<string, CPTCode> = new Map([
    ['99213', { code: '99213', description: 'Office visit, established patient, moderate complexity', category: 'Evaluation and Management' }],
    ['99214', { code: '99214', description: 'Office visit, established patient, high complexity', category: 'Evaluation and Management' }],
    ['36415', { code: '36415', description: 'Collection of venous blood by venipuncture', category: 'Laboratory' }],
    ['85025', { code: '85025', description: 'Blood count; complete (CBC), automated', category: 'Laboratory' }]
  ]);

  async validateICD10Code(code: string): Promise<{ isValid: boolean; description?: string }> {
    this.logger.debug(`Validating ICD-10 code: ${code}`);
    
    const icdInfo = this.icd10Codes.get(code);
    if (icdInfo) {
      return { isValid: true, description: icdInfo.description };
    }
    
    this.logger.warn(`Invalid ICD-10 code attempted: ${code}`);
    return { isValid: false };
  }

  async validateCPTCode(code: string): Promise<{ isValid: boolean; description?: string }> {
    this.logger.debug(`Validating CPT code: ${code}`);
    
    const cptInfo = this.cptCodes.get(code);
    if (cptInfo) {
      return { isValid: true, description: cptInfo.description };
    }
    
    this.logger.warn(`Invalid CPT code attempted: ${code}`);
    return { isValid: false };
  }
}
