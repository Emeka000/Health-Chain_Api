import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 10; i++) {
    const patient = await prisma.patient.create({
      data: {
        name: faker.name.fullName(),
        age: faker.datatype.number({ min: 1, max: 90 }),
        gender: faker.helpers.arrayElement(['Male', 'Female']),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.address.streetAddress(),
      },
    });

    await prisma.diagnosis.create({
      data: {
        patientId: patient.id,
        summary: faker.lorem.word(),
        details: faker.lorem.sentence(),
      },
    });

    await prisma.medication.create({
      data: {
        patientId: patient.id,
        name: faker.lorem.word(),
        dosage: `${faker.datatype.number({ min: 5, max: 100 })}mg`,
        frequency: '2x daily',
        startDate: faker.date.recent(10),
      },
    });

    await prisma.auditLog.create({
      data: {
        patientId: patient.id,
        action: 'CREATE_PATIENT',
        description: `Patient ${patient.name} registered`,
        userId: faker.datatype.number({ min: 1, max: 100 }),
      },
    });
  }
}

main()
  .then(() => {
    console.log('🌱 Seed completed.');
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
