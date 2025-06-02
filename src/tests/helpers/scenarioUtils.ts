import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

export const createSyntheticPatient = async () => {
  return await prisma.patient.create({
    data: {
      name: faker.name.fullName(),
      age: faker.datatype.number({ min: 1, max: 90 }),
      diagnosis: faker.lorem.word(),
      medication: faker.lorem.words(2),
    },
  });
};

export const admitPatient = async (id: number) => {
  return await prisma.patient.update({
    where: { id },
    data: {
      admitted: true,
      admissionDate: new Date(),
    },
  });
};

export const dischargePatient = async (id: number) => {
  return await prisma.patient.update({
    where: { id },
    data: {
      admitted: false,
      dischargeDate: new Date(),
    },
  });
};
