import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class MedicalCodeValidationService {
  private icd10Codes: Set<string> = new Set();
  private cptCodes: Set<string> = new Set();
  private loincCodes: Set<string> = new Set();

  async loadReferenceCodes() {
    const filePath = path.resolve(__dirname, 'reference-codes.json');
    const data = JSON.parse(await fs.readFile(filePath, 'utf-8'));
    this.icd10Codes = new Set(data.icd10);
    this.cptCodes = new Set(data.cpt);
    this.loincCodes = new Set(data.loinc);
  }

  validateICD10(code: string): boolean {
    return this.icd10Codes.has(code);
  }

  validateCPT(code: string): boolean {
    return this.cptCodes.has(code);
  }

  validateLOINC(code: string): boolean {
    return this.loincCodes.has(code);
  }
}
