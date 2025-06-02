// utils/anonymizer.ts
import { faker } from '@faker-js/faker';

export const anonymizePatient = (realPatient: any) => ({
  ...realPatient,
  name: faker.name.fullName(),
  email: faker.internet.email(),
  dob: faker.date.past(50).toISOString().split('T')[0],
  ssn: faker.finance.account(9), // fake SSN
});
