import { Controller, Get, Query } from '@nestjs/common';
import { MedicalCodeValidationService } from './medical-code-validation.service';

@Controller('data-quality')
export class DataQualityController {
  constructor(private readonly codeValidation: MedicalCodeValidationService) {}

  @Get('validate-code')
  async validateCode(
    @Query('type') type: 'icd10' | 'cpt' | 'loinc',
    @Query('code') code: string
  ) {
    await this.codeValidation.loadReferenceCodes();
    let valid = false;
    if (type === 'icd10') valid = this.codeValidation.validateICD10(code);
    if (type === 'cpt') valid = this.codeValidation.validateCPT(code);
    if (type === 'loinc') valid = this.codeValidation.validateLOINC(code);
    return { type, code, valid };
  }
}
