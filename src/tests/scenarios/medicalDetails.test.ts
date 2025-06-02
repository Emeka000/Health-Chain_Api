import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Diagnosis & Medication Management', () => {
  let patientId: number;

  beforeAll(async () => {
    const patient = await prisma.patient.create({
      data: {
        name: 'Jane Test',
        age: 30,
        gender: 'Female',
        email: 'janetest@example.com',
      },
    });
    patientId = patient.id;
  });

  it('should add diagnosis for patient', async () => {
    const diagnosis = await prisma.diagnosis.create({
      data: {
        patientId,
        summary: 'Headache',
        details: 'Recurring for 3 days',
      },
    });

    expect(diagnosis.id).toBeDefined();
    expect(diagnosis.summary).toBe('Headache');
  });

  it('should add medication for patient', async () => {
    const medication = await prisma.medication.create({
      data: {
        patientId,
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: '3x daily',
        startDate: new Date(),
      },
    });

    expect(medication.id).toBeDefined();
    expect(medication.name).toBe('Paracetamol');
  });

  it('should create audit log entry', async () => {
    const log = await prisma.auditLog.create({
      data: {
        patientId,
        action: 'ADD_MEDICATION',
        description: 'Paracetamol added for Jane',
        userId: 101,
      },
    });

    expect(log.id).toBeDefined();
    expect(log.action).toBe('ADD_MEDICATION');
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany({ where: { patientId } });
    await prisma.medication.deleteMany({ where: { patientId } });
    await prisma.diagnosis.deleteMany({ where: { patientId } });
    await prisma.patient.delete({ where: { id: patientId } });
    await prisma.$disconnect();
  });
});
