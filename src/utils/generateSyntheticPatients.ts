// utils/generateSyntheticPatients.ts
import { faker } from '@faker-js/faker';

export function generatePatients(count = 10) {
  return Array.from({ length: count }, () => ({
    name: faker.name.fullName(),
    age: faker.datatype.number({ min: 0, max: 90 }),
    diagnosis: faker.lorem.word(),
    medication: faker.lorem.words(2),
    admissionDate: faker.date.recent(),
  }));
}
