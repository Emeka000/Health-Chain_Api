import { createSyntheticPatient, admitPatient, dischargePatient } from '../helpers/scenarioUtils';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Full Medical Workflow', () => {
  let patientId: number;

  beforeAll(async () => {
    const patient = await createSyntheticPatient();
    patientId = patient.id;
  });

  it('should admit a patient', async () => {
    const updated = await admitPatient(patientId);
    expect(updated.admitted).toBe(true);
    expect(updated.admissionDate).toBeDefined();
  });

  it('should discharge the patient', async () => {
    const updated = await dischargePatient(patientId);
    expect(updated.admitted).toBe(false);
    expect(updated.dischargeDate).toBeDefined();
  });

  afterAll(async () => {
    await prisma.patient.deleteMany();
    await prisma.$disconnect();
  });
});
