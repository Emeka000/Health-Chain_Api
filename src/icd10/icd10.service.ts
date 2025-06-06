import { Injectable } from '@nestjs/common';
import icd10 from './icd10.json';

@Injectable()
export class Icd10Service {
  private codes = icd10;

  search(term: string) {
    const searchTerm = term.toLowerCase();
    return this.codes.filter(
      (entry) =>
        entry.code.toLowerCase().includes(searchTerm) ||
        entry.description.toLowerCase().includes(searchTerm)
    );
  }

  exists(code: string): boolean {
    return this.codes.some((entry) => entry.code.toLowerCase() === code.toLowerCase());
  }
}
