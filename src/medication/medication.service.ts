import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { MedicationReminder } from '../entities/medication-reminder.entity';

@Injectable()
export class MedicationService {
  constructor(
    @InjectRepository(MedicationReminder)
    private medicationRepository: Repository<MedicationReminder>,
  ) {}

  async getPatientMedications(patientId: number) {
    return this.medicationRepository.find({
      where: { patient: { id: patientId }, isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async addMedication(patientId: number, medicationData: any) {
    const medication = this.medicationRepository.create({
      ...medicationData,
      patient: { id: patientId },
    });
    return this.medicationRepository.save(medication);
  }

  async updateMedication(medicationId: number, updateData: any) {
    await this.medicationRepository.update(medicationId, updateData);
    return this.medicationRepository.findOne({ where: { id: medicationId } });
  }

  async recordAdherence(medicationId: number, taken: boolean) {
    const medication = await this.medicationRepository.findOne({ where: { id: medicationId } });
    if (medication) {
      // Simple adherence calculation - in production, you'd want more sophisticated tracking
      const newRate = taken ? Math.min(100, medication.adherenceRate + 5) : Math.max(0, medication.adherenceRate - 5);
      await this.medicationRepository.update(medicationId, { adherenceRate: newRate });
    }
  }

  async getTodaysReminders(patientId: number) {
    // Get active medications for patient and return today's scheduled reminders
    const medications = await this.medicationRepository.find({
      where: { patient: { id: patientId }, isActive: true },
    });

    const today = new Date().toISOString().split('T')[0];
    return medications.map(med => ({
      ...med,
      todaysReminders: med.reminderTimes.map(time => `${today}T${time}:00`),
    }));
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkMedicationReminders() {
    // In production, you'd implement push notifications or SMS here
    console.log('Checking medication reminders...');
    // Implementation for sending notifications would go here
  }
}