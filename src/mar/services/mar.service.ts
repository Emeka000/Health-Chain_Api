import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  MedicationOrder,
  OrderStatus,
} from '../entities/medication-order.entity';
import {
  MedicationAdministration,
  AdministrationStatus,
} from '../entities/medication-administration.entity';
import { Patient } from '../entities/patient.entity';
import { Medication } from '../entities/medication.entity';
import {
  CreateMedicationAdministrationDto,
  VerifyBarcodeDto,
} from '../dto/medication-administration.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MarService {
  constructor(
    @InjectRepository(MedicationOrder)
    private orderRepository: Repository<MedicationOrder>,
    @InjectRepository(MedicationAdministration)
    private administrationRepository: Repository<MedicationAdministration>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    @InjectRepository(Medication)
    private medicationRepository: Repository<Medication>,
  ) {}

  async getPatientMAR(patientId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await this.orderRepository.find({
      where: {
        patient: { id: patientId },
        status: OrderStatus.ACTIVE,
      },
      relations: ['medication', 'administrations', 'patient'],
    });

    const marEntries: {
      orderId: string;
      medication: Medication;
      dose: string;
      route: string;
      scheduledTime: Date;
      administration: MedicationAdministration | null;
      status: string;
    }[] = [];

    for (const order of orders) {
      if (order.scheduledTimes) {
        for (const timeSlot of order.scheduledTimes) {
          const [hours, minutes] = timeSlot.split(':');
          const scheduledDateTime = new Date(date);
          scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          const existingAdmin = order.administrations.find(
            (admin) =>
              admin.scheduledTime.getTime() === scheduledDateTime.getTime(),
          );

          marEntries.push({
            orderId: order.id,
            medication: order.medication,
            dose: order.dose,
            route: order.route,
            scheduledTime: scheduledDateTime,
            administration: existingAdmin || null,
            status: existingAdmin?.status || 'pending',
          });
        }
      }
    }

    return marEntries.sort(
      (a, b) => a.scheduledTime.getTime() - b.scheduledTime.getTime(),
    );
  }

  async verifyBarcode(verifyDto: VerifyBarcodeDto) {
    const order = await this.orderRepository.findOne({
      where: { id: verifyDto.medicationOrderId },
      relations: ['medication'],
    });

    if (!order) {
      throw new NotFoundException('Medication order not found');
    }

    const isValid = order.medication.barcode === verifyDto.barcode;

    return {
      valid: isValid,
      medication: order.medication,
      message: isValid
        ? 'Barcode verified successfully'
        : 'Barcode does not match ordered medication',
    };
  }

  async recordAdministration(
    administrationDto: CreateMedicationAdministrationDto,
  ) {
    const patient = await this.patientRepository.findOne({
      where: { id: administrationDto.patientId },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const order = await this.orderRepository.findOne({
      where: { id: administrationDto.orderId },
      relations: ['medication'],
    });

    if (!order) {
      throw new NotFoundException('Medication order not found');
    }

    const administration = this.administrationRepository.create({
      ...administrationDto,
      patient,
      order,
      scheduledTime: new Date(administrationDto.scheduledTime),
      actualTime: administrationDto.actualTime
        ? new Date(administrationDto.actualTime)
        : new Date(),
    });

    return await this.administrationRepository.save(administration);
  }

  async getMissedDoses(date?: Date) {
    const checkDate = date || new Date();
    const cutoffTime = new Date(checkDate.getTime() - 30 * 60 * 1000); // 30 minutes ago

    const missedDoses = await this.administrationRepository
      .createQueryBuilder('admin')
      .leftJoinAndSelect('admin.order', 'order')
      .leftJoinAndSelect('admin.patient', 'patient')
      .leftJoinAndSelect('order.medication', 'medication')
      .where('admin.scheduledTime < :cutoffTime', { cutoffTime })
      .andWhere('admin.status IN (:...statuses)', {
        statuses: [AdministrationStatus.MISSED, 'pending'],
      })
      .getMany();

    return missedDoses;
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async checkForMissedDoses() {
    const missedDoses = await this.getMissedDoses();

    for (const dose of missedDoses) {
      if (dose.status !== AdministrationStatus.MISSED) {
        dose.status = AdministrationStatus.MISSED;
        await this.administrationRepository.save(dose);

        // Here you would typically send notifications
        console.log(
          `Missed dose alert: Patient ${dose.patient.firstName} ${dose.patient.lastName} - ${dose.order.medication.name}`,
        );
      }
    }
  }

  async getAdministrationHistory(
    patientId: string,
    startDate: Date,
    endDate: Date,
  ) {
    return await this.administrationRepository.find({
      where: {
        patient: { id: patientId },
        scheduledTime: Between(startDate, endDate),
      },
      relations: ['order', 'order.medication', 'patient'],
      order: { scheduledTime: 'DESC' },
    });
  }
}
