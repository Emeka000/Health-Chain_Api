// tests/patient.test.ts
import { anonymizePatient } from '../utils/anonymizer';

describe('Patient Data Handling', () => {
  it('should anonymize sensitive fields', () => {
    const patient = { name: 'John Doe', ssn: '123-45-6789' };
    const anon = anonymizePatient(patient);
    expect(anon.name).not.toBe('John Doe');
    expect(anon.ssn).not.toBe('123-45-6789');
  });
});
